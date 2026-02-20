package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.instant.InstantBuyPriceDto;
import ru.itmo.backend.dto.user.AdminUserDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.exception.UnauthorizedException;
import ru.itmo.backend.model.InstantBuyPrice;
import ru.itmo.backend.model.Skin;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.enums.UserRole;
import ru.itmo.backend.repository.InstantBuyRepository;
import ru.itmo.backend.repository.SkinRepository;
import ru.itmo.backend.repository.UserRepository;
import ru.itmo.backend.dao.CleanupDao;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CleanupDao cleanupDao;
    private final InstantBuyRepository instantBuyRepository;
    private final SkinRepository skinRepository;
    private final UserRepository userRepository;
    private final AuthService authService;


    public int cleanupExpiredReservations() {
        return cleanupDao.cleanupExpiredReservations();
    }

    @Transactional
    public InstantBuyPriceDto upsertInstantBuyPrice(Integer skinId, Integer userId, Integer price) {
        if (skinId == null || skinId <= 0) throw new BadRequestException("skinId must be > 0");
        if (userId == null || userId <= 0) throw new BadRequestException("userId must be > 0");
        if (price == null || price <= 0) throw new BadRequestException("price must be > 0");

        Skin skin = skinRepository.findById(skinId)
                .orElseThrow(() -> new NotFoundException("Skin not found: " + skinId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        InstantBuyPrice entity = instantBuyRepository
                .findBySkin_IdAndUpdatedBy_Id(skinId, userId)
                .orElseGet(() -> InstantBuyPrice.builder()
                        .skin(skin)
                        .updatedBy(user)
                        .build()
                );

        entity.setPrice(price);
        entity.setUpdatedAt(LocalDateTime.now());

        InstantBuyPrice saved = instantBuyRepository.save(entity);

        return InstantBuyPriceDto.builder()
                .id(saved.getId())
                .price(saved.getPrice())
                .updatedAt(saved.getUpdatedAt())
                .skinId(skinId)
                .userId(userId)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getUsers() {
        return userRepository.findAll().stream().map(u -> AdminUserDto.builder()
                .id(u.getId())
                .steamId(u.getSteamId())
                .nickname(u.getNickname())
                .role(u.getRole().name())
                .balance(u.getBalance())
                .createdAt(u.getCreatedAt())
                .build()
        ).toList();
    }

    @Transactional
    public AdminUserDto setUserRole(Integer userId, String role) {
        if (userId == null || userId <= 0) throw new BadRequestException("userId must be > 0");
        User u = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found: " + userId));
        UserRole r;
        try { r = UserRole.valueOf(role.toUpperCase()); }
        catch (Exception e) { throw new BadRequestException("Invalid role: " + role); }
        u.setRole(r);
        User saved = userRepository.save(u);
        return AdminUserDto.builder()
                .id(saved.getId()).steamId(saved.getSteamId()).nickname(saved.getNickname())
                .role(saved.getRole().name()).balance(saved.getBalance()).createdAt(saved.getCreatedAt())
                .build();
    }

    public void requireAdmin(String authHeader) {
        User u = authService.requireUser(authHeader);
        if (u.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Admin only");
        }
    }


}
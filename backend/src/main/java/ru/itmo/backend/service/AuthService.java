package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.auth.AuthUserDto;
import ru.itmo.backend.dto.auth.SteamLoginRequestDto;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.enums.UserRole;
import ru.itmo.backend.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public AuthUserDto loginOrRegister(SteamLoginRequestDto req) {
        String steamId = req.getSteamId().trim();

        User user = userRepository.findBySteamId(steamId)
                .orElseGet(() -> {
                    User u = User.builder()
                            .steamId(steamId)
                            .nickname(req.getNickname() == null || req.getNickname().isBlank()
                                    ? "User#" + steamId.substring(Math.max(0, steamId.length() - 4))
                                    : req.getNickname().trim())
                            .role(UserRole.USER)
                            .balance(0)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(u);
                });

        if (req.getNickname() != null && !req.getNickname().isBlank()
                && !req.getNickname().trim().equals(user.getNickname())) {
            user.setNickname(req.getNickname().trim());
            user = userRepository.save(user);
        }

        return AuthUserDto.builder()
                .id(user.getId())
                .steamId(user.getSteamId())
                .nickname(user.getNickname())
                .role(user.getRole().name())
                .balance(user.getBalance())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

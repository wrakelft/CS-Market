package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.user.UserProfileDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.model.User;
import ru.itmo.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Integer userId) {
        if (userId == null || userId <= 0) {
            throw new BadRequestException("userId must be positive");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return UserProfileDto.builder()
                .id(user.getId())
                .steamId(user.getSteamId())
                .nickname(user.getNickname())
                .balance(user.getBalance())
                .build();
    }
}
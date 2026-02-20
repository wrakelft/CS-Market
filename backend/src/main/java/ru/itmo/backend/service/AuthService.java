package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.auth.*;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.exception.UnauthorizedException;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.UserCredential;
import ru.itmo.backend.model.UserSession;
import ru.itmo.backend.model.enums.UserRole;
import ru.itmo.backend.repository.UserCredentialRepository;
import ru.itmo.backend.repository.UserRepository;
import ru.itmo.backend.repository.UserSessionRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final UserSessionRepository sessionRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private static final String BEARER = "Bearer ";
    private static final int SESSION_DAYS = 7;

    @Transactional
    public AuthResponseDto register(RegisterRequestDto req) {
        String steamId = req.getSteamId().trim();

        if (userRepository.findBySteamId(steamId).isPresent()) {
            throw new BadRequestException("User already exists");
        }

        User user = userRepository.save(User.builder()
                .steamId(steamId)
                .nickname(req.getNickname().trim())
                .role(UserRole.USER)
                .balance(0)
                .createdAt(LocalDateTime.now())
                .build());

        credentialRepository.save(UserCredential.builder()
                .user(user)
                .passwordHash(encoder.encode(req.getPassword()))
                .createdAt(LocalDateTime.now())
                .build());

        String token = createSession(user);
        return AuthResponseDto.builder().token(token).user(toDto(user)).build();
    }

    @Transactional
    public AuthResponseDto login(LoginRequestDto req) {
        String steamId = req.getSteamId().trim();

        User user = userRepository.findBySteamId(steamId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserCredential cred = credentialRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Credentials not set"));

        if (!encoder.matches(req.getPassword(), cred.getPasswordHash())) {
            throw new UnauthorizedException("Wrong password");
        }

        String token = createSession(user);
        return AuthResponseDto.builder().token(token).user(toDto(user)).build();
    }

    @Transactional(readOnly = true)
    public AuthUserDto me(String authHeader) {
        User user = requireUser(authHeader);
        return toDto(user);
    }

    @Transactional
    public void logout(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) return;
        if (!authHeader.startsWith(BEARER)) return;
        String token = authHeader.substring(BEARER.length()).trim();
        if (!token.isBlank()) sessionRepository.deleteById(token);
    }

    @Transactional(readOnly = true)
    public User requireUser(String authHeader) {
        String token = extractToken(authHeader);

        UserSession s = sessionRepository.findById(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid session"));

        if (s.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Session expired");
        }

        return s.getUser();
    }

    private String createSession(User user) {
        String token = UUID.randomUUID().toString().replace("-", ""); // 32 символа
        LocalDateTime now = LocalDateTime.now();

        sessionRepository.save(UserSession.builder()
                .token(token)
                .user(user)
                .createdAt(now)
                .expiresAt(now.plusDays(SESSION_DAYS))
                .build());

        return token;
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new UnauthorizedException("Missing Authorization header");
        }
        if (!authHeader.startsWith(BEARER)) {
            throw new UnauthorizedException("Invalid Authorization header");
        }
        String token = authHeader.substring(BEARER.length()).trim();
        if (token.isBlank()) throw new UnauthorizedException("Empty token");
        return token;
    }

    private AuthUserDto toDto(User user) {
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
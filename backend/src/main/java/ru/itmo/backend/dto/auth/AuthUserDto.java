package ru.itmo.backend.dto.auth;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AuthUserDto {
    Integer id;
    String steamId;
    String nickname;
    String role;
    Integer balance;
    LocalDateTime createdAt;
}

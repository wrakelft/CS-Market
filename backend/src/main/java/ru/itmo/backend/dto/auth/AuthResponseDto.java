package ru.itmo.backend.dto.auth;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponseDto {
    String token;
    AuthUserDto user;
}
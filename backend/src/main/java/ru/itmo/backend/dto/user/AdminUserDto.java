package ru.itmo.backend.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserDto {
    private Integer id;
    private String steamId;
    private String nickname;
    private String role;
    private Integer balance;
    private LocalDateTime createdAt;
}

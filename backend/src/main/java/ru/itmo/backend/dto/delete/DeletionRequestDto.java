package ru.itmo.backend.dto.delete;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DeletionRequestDto {
    private Integer id;
    private Integer userId;

    private String status;      // PENDING / APPROVED / REJECTED (или как у тебя в БД)
    private String reason;      // причина, если rejected
    private LocalDateTime createdAt;
    private LocalDateTime decidedAt;
    private Integer decidedBy;  // adminId если есть
}
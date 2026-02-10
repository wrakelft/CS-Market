package ru.itmo.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PaymentOperationDto {
    private Integer id;
    private String type;
    private String method;
    private String status;
    private Integer amount;
    private LocalDateTime createdAt;
    private Integer userId;
}
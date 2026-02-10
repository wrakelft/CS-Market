package ru.itmo.backend.dto.instant;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InstantBuyPriceDto {
    private Integer id;
    private Integer price;
    private LocalDateTime updatedAt;
    private Integer skinId;
    private Integer userId;
}
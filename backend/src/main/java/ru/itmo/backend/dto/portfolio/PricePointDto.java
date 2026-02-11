package ru.itmo.backend.dto.portfolio;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PricePointDto {
    private LocalDateTime time;
    private Integer price;
}
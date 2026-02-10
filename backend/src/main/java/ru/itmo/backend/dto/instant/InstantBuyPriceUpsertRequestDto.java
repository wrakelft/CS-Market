package ru.itmo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InstantBuyPriceUpsertRequestDto {

    @NotNull @Min(1)
    private Integer skinId;

    @NotNull @Min(1)
    private Integer userId;

    @NotNull @Min(1)
    private Integer price;
}
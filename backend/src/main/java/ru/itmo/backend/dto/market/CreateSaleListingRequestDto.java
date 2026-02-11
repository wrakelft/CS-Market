package ru.itmo.backend.dto.market;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateSaleListingRequestDto {

    @NotNull @Positive
    private Integer sellerId;

    @NotNull @Positive
    private Integer inventoryItemId;

    @NotNull @Positive
    private Integer price;
}

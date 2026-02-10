package ru.itmo.backend.dto.cart;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull @Positive
    private Integer userId;

    @NotNull @Positive
    private Integer saleListingId;
}

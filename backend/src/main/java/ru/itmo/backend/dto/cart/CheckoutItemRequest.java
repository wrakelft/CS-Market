package ru.itmo.backend.dto.cart;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CheckoutItemRequest {
    @NotNull @Positive
    private Integer userId;

    @NotNull @Positive
    private Integer cartItemId;
}

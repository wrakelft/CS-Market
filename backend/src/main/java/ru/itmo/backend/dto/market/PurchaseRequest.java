package ru.itmo.backend.dto.market;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PurchaseRequest {
    @NotNull
    @Positive
    private Integer buyerId;

    @NotNull
    @Positive
    private Integer saleListingId;
}

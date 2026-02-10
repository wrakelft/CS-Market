package ru.itmo.backend.dto.cart;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class CartItemDto {
    Integer id;
    Integer price;
    String itemStatus;
    LocalDateTime reservedUntil;

    Integer saleListingId;
    Integer inventoryItemId;
    Integer skinId;
    String skinName;
    Integer transactionId;
}

package ru.itmo.backend.dto.market;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SaleListingCreatedDto {
    Integer id;
    Integer price;
    String status;
    Integer inventoryItemId;
}

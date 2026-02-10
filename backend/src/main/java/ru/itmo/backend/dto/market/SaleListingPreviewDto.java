package ru.itmo.backend.dto.market;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SaleListingPreviewDto {
    Integer id;
    Integer price;
    String status;

    Integer inventoryItemId;
    Integer sellerId;

    Integer skinId;
    String skinName;
    String rarity;
    String condition;
    String collection;
}

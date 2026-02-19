package ru.itmo.backend.dto.inventory;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class InventoryItemDto {
    Integer id;
    String ownershipFlag;
    LocalDateTime receivedAt;
    Boolean tradable;
    Integer skinId;
    String skinName;
    String collection;
    String rarity;
    String condition;

}

package ru.itmo.backend.mapper;

import org.springframework.stereotype.Component;
import ru.itmo.backend.dto.inventory.InventoryItemDto;
import ru.itmo.backend.model.InventoryItem;

@Component
public class InventoryItemMapper {

    public InventoryItemDto toDto(InventoryItem item, boolean tradable) {
        var skin = item.getSkin();

        return InventoryItemDto.builder()
                .id(item.getId())
                .ownershipFlag(item.getOwnershipFlag().name())
                .receivedAt(item.getReceivedAt())
                .tradable(tradable)
                .skinId(skin.getId())
                .skinName(skin.getName())
                .collection(skin.getCollection())
                .rarity(skin.getRarity())
                .condition(skin.getCondition())
                .build();
    }
}

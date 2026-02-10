package ru.itmo.backend.mapper;

import ru.itmo.backend.dto.market.SaleListingPreviewDto;
import ru.itmo.backend.model.SaleListing;

public final class SaleListingMapper {

    private SaleListingMapper() {}

    public static SaleListingPreviewDto toPreviewDto(SaleListing saleListing) {
        var inv = saleListing.getInventoryItem();
        var skin = inv.getSkin();
        var seller = inv.getUser();

        return SaleListingPreviewDto.builder()
                .id(saleListing.getId())
                .price(saleListing.getPrice())
                .status(saleListing.getStatus().name())
                .inventoryItemId(inv.getId())
                .sellerId(seller.getId())
                .skinId(skin.getId())
                .skinName(skin.getName())
                .rarity(skin.getRarity())
                .condition(skin.getCondition())
                .collection(skin.getCollection())
                .build();
    }
}

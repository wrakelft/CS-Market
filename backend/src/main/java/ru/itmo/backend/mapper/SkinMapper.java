package ru.itmo.backend.mapper;

import ru.itmo.backend.dto.market.SkinPreviewDto;
import ru.itmo.backend.model.Skin;

public final class SkinMapper {
    private SkinMapper() {}

    public static SkinPreviewDto toPreviewDto(Skin skin) {
        return SkinPreviewDto.builder()
                .id(skin.getId())
                .name(skin.getName())
                .collection(skin.getCollection())
                .rarity(skin.getRarity())
                .condition(skin.getCondition())
                .build();
    }
}

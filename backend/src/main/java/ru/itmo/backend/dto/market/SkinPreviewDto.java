package ru.itmo.backend.dto.market;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SkinPreviewDto {
    Integer id;
    String name;
    String collection;
    String rarity;
    String condition;
}

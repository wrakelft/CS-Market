package ru.itmo.backend.dto.cart;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class CartDto {
    Integer id;
    Integer userId;
    String status;
    LocalDateTime reservedUntil;
    LocalDateTime createdAt;
    List<CartItemDto> items;
}

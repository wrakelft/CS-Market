package ru.itmo.backend.mapper;

import ru.itmo.backend.dto.cart.CartDto;
import ru.itmo.backend.dto.cart.CartItemDto;
import ru.itmo.backend.model.Cart;
import ru.itmo.backend.model.CartItem;

import java.util.List;

public final class CartMapper {

    private CartMapper() {}

    public static CartDto toDto(Cart cart, List<CartItem> items) {
        return CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .status(cart.getStatus().name())
                .reservedUntil(cart.getReservedUntil())
                .createdAt(cart.getCreatedAt())
                .items(items.stream().map(CartMapper::toItemDto).toList())
                .build();
    }

    public static CartItemDto toItemDto(CartItem e) {
        var listing = e.getSaleListing();
        var inv = listing.getInventoryItem();
        var skin = inv.getSkin();

        return CartItemDto.builder()
                .id(e.getId())
                .price(e.getPrice())
                .itemStatus(e.getItemStatus().name())
                .reservedUntil(e.getReservedUntil())
                .saleListingId(listing.getId())
                .inventoryItemId(inv.getId())
                .skinId(skin.getId())
                .skinName(skin.getName())
                .transactionId(e.getTransaction() != null ? e.getTransaction().getId() : null)
                .build();
    }
}

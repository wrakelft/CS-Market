package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.cart.AddToCartRequest;
import ru.itmo.backend.dto.cart.CartDto;
import ru.itmo.backend.dto.cart.CheckoutItemRequest;
import ru.itmo.backend.service.CartService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    @PostMapping("/item")
    public CartDto add(@Valid @RequestBody AddToCartRequest req) {
        return cartService.addItem(req.getUserId(), req.getSaleListingId());
    }

    @GetMapping("/{userId}")
    public CartDto get(@PathVariable Integer userId) {
        return cartService.getCart(userId);
    }

    @DeleteMapping("/{userId}/items/{cartItemId}")
    public CartDto remove(@PathVariable Integer userId, @PathVariable Integer cartItemId) {
        return cartService.removeItem(userId, cartItemId);
    }

    @PostMapping("/checkout-item")
    public String checkoutItem(@Valid @RequestBody CheckoutItemRequest req) {
        cartService.checkoutItem(req.getUserId(), req.getCartItemId());
        return "OK";
    }

}

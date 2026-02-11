package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dao.PurchaseDao;
import ru.itmo.backend.dto.cart.CartDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.mapper.CartMapper;
import ru.itmo.backend.model.Cart;
import ru.itmo.backend.model.CartItem;
import ru.itmo.backend.model.SaleListing;
import ru.itmo.backend.model.enums.CartItemStatus;
import ru.itmo.backend.model.enums.CartStatus;
import ru.itmo.backend.model.enums.SaleListingStatus;
import ru.itmo.backend.repository.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final SaleListingRepository saleListingRepository;
    private final PurchaseDao purchaseDao;

    @Transactional
    public CartDto addItem(Integer userId, Integer saleListingId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        var listing = saleListingRepository.findByIdAndStatus(saleListingId, SaleListingStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active sale listing not found"));

        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseGet(() -> cartRepository.save(Cart.builder()
                        .user(user)
                        .status(CartStatus.ACTIVE)
                        .createdAt(LocalDateTime.now())
                        .build()));
        cartItemRepository.findByCartIdAndSaleListingId(cart.getId(), saleListingId)
                .ifPresent(x -> { throw new BadRequestException("Item already in cart"); });
        CartItem item = CartItem.builder()
                .cart(cart)
                .saleListing(listing)
                .price(listing.getPrice())
                .itemStatus(CartItemStatus.ACTIVE)
                .build();

        try {
            cartItemRepository.save(item);
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMostSpecificCause().getMessage();
            if (msg != null && msg.toLowerCase().contains("already reserved")) {
                throw new BadRequestException("Sale listing is already reserved");
            }

            throw e;
        }
        var items = cartItemRepository.findByCartId(cart.getId());
        return CartMapper.toDto(cart, items);
    }

    @Transactional(readOnly = true)
    public CartDto getCart(Integer userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active cart not found"));

        var items = cartItemRepository.findByCartId(cart.getId());
        return CartMapper.toDto(cart, items);
    }

    @Transactional
    public CartDto removeItem(Integer userId, Integer cartItemId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active cart not found"));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to this user");
        }

        cartItemRepository.delete(item);

        var items = cartItemRepository.findByCartId(cart.getId());
        return CartMapper.toDto(cart, items);
    }

    @Transactional
    public void checkoutItem(Integer userId, Integer cartItemId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active cart not found"));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to this user");
        }

        if (item.getItemStatus() != CartItemStatus.RESERVED && item.getItemStatus() != CartItemStatus.ACTIVE) {
            throw new BadRequestException("Cart item is not purchasable");
        }

        if (item.getReservedUntil() != null && item.getReservedUntil().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reservation expired");
        }

        SaleListing listing = item.getSaleListing();

        if (listing.getStatus() != SaleListingStatus.ACTIVE) {
            throw new BadRequestException("Sale listing is not active");
        }

        Integer sellerId = listing.getInventoryItem().getUser().getId();
        if (sellerId.equals(userId)) {
            throw new BadRequestException("Buyer cannot be seller");
        }

        purchaseDao.executePurchase(userId, sellerId, listing.getInventoryItem().getId(), listing.getPrice());
    }

}

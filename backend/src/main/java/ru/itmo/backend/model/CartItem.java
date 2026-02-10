package ru.itmo.backend.model;

import jakarta.persistence.*;
import lombok.*;
import ru.itmo.backend.model.enums.CartItemStatus;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_status", nullable = false, length = 64)
    private CartItemStatus itemStatus;

    @Column(name = "reserved_until")
    private LocalDateTime reservedUntil;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_listing_id", nullable = false)
    private SaleListing saleListing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;
}

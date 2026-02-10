package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
}

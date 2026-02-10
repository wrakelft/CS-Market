package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.Cart;
import ru.itmo.backend.model.enums.CartStatus;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUserIdAndStatus(Integer userId, CartStatus status);
}

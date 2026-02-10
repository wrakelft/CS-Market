package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.Cart;

public interface CartRepository extends JpaRepository<Cart, Integer> {
}

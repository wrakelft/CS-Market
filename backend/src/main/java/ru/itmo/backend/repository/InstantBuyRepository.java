package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.InstantBuyPrice;

public interface InstantBuyRepository extends JpaRepository<InstantBuyPrice, Integer> {
}

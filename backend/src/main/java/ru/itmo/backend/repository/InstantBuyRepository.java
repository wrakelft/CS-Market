package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.InstantBuyPrice;

import java.util.Optional;

public interface InstantBuyRepository extends JpaRepository<InstantBuyPrice, Integer> {
    Optional<InstantBuyPrice> findBySkin_IdAndUpdatedBy_Id(Integer skinId, Integer userId);
}
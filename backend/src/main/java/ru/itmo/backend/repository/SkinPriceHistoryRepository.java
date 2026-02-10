package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.SkinPriceHistory;

public interface SkinPriceHistoryRepository extends JpaRepository<SkinPriceHistory, Integer> {
}

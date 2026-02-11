package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.SkinPriceHistory;

import java.time.LocalDateTime;
import java.util.List;

public interface SkinPriceHistoryRepository extends JpaRepository<SkinPriceHistory, Integer> {
    List<SkinPriceHistory> findTop200BySkin_IdOrderByRecordedAtDesc(Integer skinId);

    List<SkinPriceHistory> findAllBySkin_IdAndRecordedAtBetweenOrderByRecordedAtAsc(
            Integer skinId,
            LocalDateTime from,
            LocalDateTime to
    );
}
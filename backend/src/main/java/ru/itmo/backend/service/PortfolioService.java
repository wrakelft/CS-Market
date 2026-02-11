package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.portfolio.PricePointDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.repository.SkinRepository;
import ru.itmo.backend.repository.SkinPriceHistoryRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final SkinRepository skinRepository;
    private final SkinPriceHistoryRepository skinPriceHistoryRepository;

    @Transactional(readOnly = true)
    public List<PricePointDto> getSkinPriceHistory(Integer skinId, LocalDateTime from, LocalDateTime to) {
        if (skinId == null || skinId <= 0)
            throw new BadRequestException("skinId must be > 0");

        skinRepository.findById(skinId)
                .orElseThrow(() -> new NotFoundException("Skin not found: " + skinId));

        // если даты не передали — последние 200 точек
        if (from == null || to == null) {
            return skinPriceHistoryRepository
                    .findTop200BySkin_IdOrderByRecordedAtDesc(skinId)
                    .stream()
                    .sorted((a, b) -> a.getRecordedAt().compareTo(b.getRecordedAt()))
                    .map(p -> PricePointDto.builder()
                            .time(p.getRecordedAt())
                            .price(p.getPrice())
                            .build())
                    .toList();
        }

        if (from.isAfter(to))
            throw new BadRequestException("from must be <= to");

        return skinPriceHistoryRepository
                .findAllBySkin_IdAndRecordedAtBetweenOrderByRecordedAtAsc(skinId, from, to)
                .stream()
                .map(p -> PricePointDto.builder()
                        .time(p.getRecordedAt())
                        .price(p.getPrice())
                        .build())
                .toList();
    }
}
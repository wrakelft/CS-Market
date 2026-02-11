package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.portfolio.PricePointDto;
import ru.itmo.backend.service.PortfolioService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    // График цены по скину
    @GetMapping("/skins/{skinId}/price-history")
    public List<PricePointDto> skinPriceHistory(
            @PathVariable Integer skinId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return portfolioService.getSkinPriceHistory(skinId, from, to);
    }
}
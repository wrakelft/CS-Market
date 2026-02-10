package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.CleanupResponseDto;
import ru.itmo.backend.dto.InstantBuyPriceUpsertRequestDto;
import ru.itmo.backend.dto.instant.InstantBuyPriceDto;
import ru.itmo.backend.service.AdminService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/cleanup-reservations")
    public CleanupResponseDto cleanup() {
        int cleared = adminService.cleanupExpiredReservations();
        return CleanupResponseDto.builder()
                .cleared(cleared)
                .build();
    }

    @PostMapping("/instant-prices")
    public InstantBuyPriceDto createInstantPrice(
            @Valid @RequestBody InstantBuyPriceUpsertRequestDto req
    ) {
        return adminService.upsertInstantBuyPrice(
                req.getSkinId(),
                req.getUserId(),
                req.getPrice()
        );
    }

    @PutMapping("/instant-prices")
    public InstantBuyPriceDto updateInstantPrice(
            @Valid @RequestBody InstantBuyPriceUpsertRequestDto req
    ) {
        return adminService.upsertInstantBuyPrice(
                req.getSkinId(),
                req.getUserId(),
                req.getPrice()
        );
    }
}
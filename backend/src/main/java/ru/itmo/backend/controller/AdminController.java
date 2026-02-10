package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.InstantBuyPriceDto;
import ru.itmo.backend.service.AdminService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/cleanup-reservations")
    public Map<String, Integer> cleanup() {
        int cleared = adminService.cleanupExpiredReservations();
        return Map.of("cleared", cleared);
    }

    @PostMapping("/instant-price")
    public InstantBuyPriceDto upsertInstantPrice(@RequestParam Integer skinId,
                                                 @RequestParam Integer userId,
                                                 @RequestParam Integer price) {
        return adminService.upsertInstantBuyPrice(skinId, userId, price);
    }
}
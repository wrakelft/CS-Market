package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.market.PurchaseRequest;
import ru.itmo.backend.dto.market.SaleListingPreviewDto;
import ru.itmo.backend.dto.market.SkinPreviewDto;
import ru.itmo.backend.service.MarketService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/market")
public class MarketController {
    private final MarketService marketService;

    @GetMapping("/sale-listings")
    public List<SaleListingPreviewDto> listSale() {
        return marketService.getActiveSaleListings();
    }

    @GetMapping("/skins")
    public List<SkinPreviewDto> skins(@RequestParam(required = false) String q,
                                      @RequestParam(required = false) String collection,
                                      @RequestParam(required = false) String rarity,
                                      @RequestParam(required = false) String condition) {
        return marketService.getSkins(q, collection, rarity, condition);
    }
}

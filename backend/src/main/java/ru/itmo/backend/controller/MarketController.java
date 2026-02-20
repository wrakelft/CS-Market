package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.market.*;
import ru.itmo.backend.service.MarketService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/market")
public class MarketController {
    private final MarketService marketService;

    @GetMapping("/sale-listings")
    public List<SaleListingPreviewDto> listSale(@RequestParam(required = false) Integer ownerId) {
        return marketService.getSaleListings(ownerId);
    }

    @GetMapping("/skins")
    public List<SkinPreviewDto> skins(@RequestParam(required = false) String q,
                                      @RequestParam(required = false) String collection,
                                      @RequestParam(required = false) String rarity,
                                      @RequestParam(required = false) String condition) {
        return marketService.getSkins(q, collection, rarity, condition);
    }

    @PostMapping("/sale-listings")
    public SaleListingCreatedDto createSaleListing(@Valid @RequestBody CreateSaleListingRequestDto req) {
        return marketService.createSaleListing(req);
    }

    @PostMapping("/sale-listings/{id}/cancel")
    public void cancelSale(@PathVariable Integer id, @RequestParam Integer sellerId) {
        marketService.cancelSaleListing(sellerId, id);
    }

    @PostMapping("/sale-listings/{id}/instant-sell")
    public void instantSell(@PathVariable Integer id, @RequestParam Integer sellerId) {
        marketService.instantSell(sellerId, id);
    }

    @GetMapping("/skins/{skinId}/instant-price")
    public Map<String, Integer> instantPrice(@PathVariable Integer skinId) {
        return Map.of("price", marketService.getInstantPrice(skinId));
    }
}

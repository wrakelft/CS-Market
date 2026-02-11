package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dao.PurchaseDao;
import ru.itmo.backend.dto.market.CreateSaleListingRequestDto;
import ru.itmo.backend.dto.market.SaleListingCreatedDto;
import ru.itmo.backend.dto.market.SaleListingPreviewDto;
import ru.itmo.backend.dto.market.SkinPreviewDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.mapper.SaleListingMapper;
import ru.itmo.backend.mapper.SkinMapper;
import ru.itmo.backend.model.InventoryItem;
import ru.itmo.backend.model.SaleListing;
import ru.itmo.backend.model.Skin;
import ru.itmo.backend.model.enums.SaleListingStatus;
import ru.itmo.backend.repository.InventoryItemRepository;
import ru.itmo.backend.repository.SaleListingRepository;
import ru.itmo.backend.repository.SkinRepository;

import java.util.List;

import static ru.itmo.backend.repository.spec.SkinSpecifications.*;


@Service
@RequiredArgsConstructor
public class MarketService {
    private final SkinRepository skinRepository;
    private final SaleListingRepository saleListingRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Transactional(readOnly = true)
    public List<SaleListingPreviewDto> getActiveSaleListings() {
        return saleListingRepository.findByStatus(SaleListingStatus.ACTIVE)
                .stream()
                .map(SaleListingMapper::toPreviewDto)
                .toList();
    }

    @Transactional
    public SaleListingCreatedDto createSaleListing(CreateSaleListingRequestDto req) {
        InventoryItem item = inventoryItemRepository.findById(req.getInventoryItemId())
                .orElseThrow(() -> new NotFoundException("Inventory item not found"));

        if (!item.getUser().getId().equals(req.getSellerId())) {
            throw new BadRequestException("Inventory item does not belong to seller");
        }

        saleListingRepository.findFirstByInventoryItemIdAndStatus(req.getInventoryItemId(), SaleListingStatus.ACTIVE)
                .ifPresent(x -> { throw new BadRequestException("Sale listing already exists for this inventory item"); });

        try {
            SaleListing listing = SaleListing.builder()
                    .price(req.getPrice())
                    .status(SaleListingStatus.ACTIVE)
                    .inventoryItem(item)
                    .build();

            SaleListing saved = saleListingRepository.save(listing);

            return SaleListingCreatedDto.builder()
                    .id(saved.getId())
                    .price(saved.getPrice())
                    .status(saved.getStatus().name())
                    .inventoryItemId(saved.getInventoryItem().getId())
                    .build();
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Sale listing already exists for this inventory item");
        }
    }

    @Transactional(readOnly = true)
    public List<SkinPreviewDto> getSkins(String q, String collection, String rarity, String condition) {
        Specification<Skin> spec = (root, query, cb) -> cb.conjunction();

        Specification<Skin> s1 = nameContains(q);
        if (s1 != null) spec = spec.and(s1);

        Specification<Skin> s2 = hasCollection(collection);
        if (s2 != null) spec = spec.and(s2);

        Specification<Skin> s3 = hasRarity(rarity);
        if (s3 != null) spec = spec.and(s3);

        Specification<Skin> s4 = hasCondition(condition);
        if (s4 != null) spec = spec.and(s4);

        return skinRepository.findAll(spec).stream()
                .map(SkinMapper::toPreviewDto)
                .toList();
    }

    @Transactional
    public void instantSell(Integer sellerId, Integer saleListingId) {
        SaleListing listing = saleListingRepository.findById(saleListingId)
                .orElseThrow(() -> new NotFoundException("Sale listing not found"));

        if (listing.getStatus() != SaleListingStatus.ACTIVE) {
            throw new BadRequestException("Sale listing is not active");
        }

        Integer realSellerId = listing.getInventoryItem().getUser().getId();
        if (!realSellerId.equals(sellerId)) {
            throw new BadRequestException("Sale listing does not belong to seller");
        }

        listing.setStatus(SaleListingStatus.INSTANT_SALE);
        saleListingRepository.save(listing);
    }



}

package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dao.PurchaseDao;
import ru.itmo.backend.dto.market.SaleListingPreviewDto;
import ru.itmo.backend.dto.market.SkinPreviewDto;
import ru.itmo.backend.mapper.SaleListingMapper;
import ru.itmo.backend.mapper.SkinMapper;
import ru.itmo.backend.model.Skin;
import ru.itmo.backend.model.enums.SaleListingStatus;
import ru.itmo.backend.repository.SaleListingRepository;
import ru.itmo.backend.repository.SkinRepository;

import java.util.List;

import static ru.itmo.backend.repository.spec.SkinSpecifications.*;


@Service
@RequiredArgsConstructor
public class MarketService {
    private final SkinRepository skinRepository;
    private final SaleListingRepository saleListingRepository;

    @Transactional(readOnly = true)
    public List<SaleListingPreviewDto> getActiveSaleListings() {
        return saleListingRepository.findByStatus(SaleListingStatus.ACTIVE)
                .stream()
                .map(SaleListingMapper::toPreviewDto)
                .toList();
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
}

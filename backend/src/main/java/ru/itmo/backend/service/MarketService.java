package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dao.PurchaseDao;
import ru.itmo.backend.dto.market.SaleListingPreviewDto;
import ru.itmo.backend.mapper.SaleListingMapper;
import ru.itmo.backend.model.enums.SaleListingStatus;
import ru.itmo.backend.repository.SaleListingRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {
    private final SaleListingRepository saleListingRepository;

    @Transactional(readOnly = true)
    public List<SaleListingPreviewDto> getActiveSaleListings() {
        return saleListingRepository.findByStatus(SaleListingStatus.ACTIVE)
                .stream()
                .map(SaleListingMapper::toPreviewDto)
                .toList();
    }
}

package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.SaleListing;
import ru.itmo.backend.model.enums.SaleListingStatus;

import java.util.List;
import java.util.Optional;

public interface SaleListingRepository extends JpaRepository<SaleListing, Integer> {
    List<SaleListing> findByStatus(SaleListingStatus status);
    Optional<SaleListing> findByIdAndStatus(Integer id, SaleListingStatus status);
    Optional<SaleListing> findFirstByInventoryItemIdAndStatus(Integer inventoryItemId, SaleListingStatus status);
}

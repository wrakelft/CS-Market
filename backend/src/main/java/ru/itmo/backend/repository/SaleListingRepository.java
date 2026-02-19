package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.itmo.backend.model.SaleListing;
import ru.itmo.backend.model.enums.SaleListingStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SaleListingRepository extends JpaRepository<SaleListing, Integer> {
    List<SaleListing> findByStatus(SaleListingStatus status);
    Optional<SaleListing> findByIdAndStatus(Integer id, SaleListingStatus status);
    Optional<SaleListing> findFirstByInventoryItemIdAndStatus(Integer inventoryItemId, SaleListingStatus status);

    @Query("select s.inventoryItem.id from SaleListing s where s.inventoryItem.id in :ids and s.status in :statuses")
    List<Integer> findBusyInventoryItemsIds(@Param("ids") List<Integer> inventoryItemIds,
                                            @Param("statuses") Collection<SaleListingStatus> statuses);
}

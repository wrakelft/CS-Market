package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.itmo.backend.model.RentalListing;

import java.util.List;

public interface RentalListingRepository extends JpaRepository<RentalListing, Integer> {

    @Override
    @EntityGraph(attributePaths = {
            "inventoryItem",
            "inventoryItem.skin",
            "inventoryItem.user"
    })
    List<RentalListing> findAll();

    boolean existsByInventoryItemId(Integer inventoryItemId);

    @Query("select r.inventoryItem.id from RentalListing r where r.inventoryItem.id in :ids")
    List<Integer> findBusyInventoryItemIds(@Param("ids") List<Integer> inventoryItemIds);
}
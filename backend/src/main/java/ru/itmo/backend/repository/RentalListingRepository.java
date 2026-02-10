package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
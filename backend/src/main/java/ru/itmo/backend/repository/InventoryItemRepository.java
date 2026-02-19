package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.InventoryItem;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {

    @EntityGraph(attributePaths = {"skin", "user"})
    List<InventoryItem> findByUserId(Integer userId);
}

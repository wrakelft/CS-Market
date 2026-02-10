package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.DeletionRequest;

import java.util.List;

public interface DeletionRequestRepository extends JpaRepository<DeletionRequest, Integer> {
    List<DeletionRequest> findByUserId(Long userId);
}
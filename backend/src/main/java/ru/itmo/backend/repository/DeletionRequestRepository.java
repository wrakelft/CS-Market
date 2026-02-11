package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.DeletionRequest;
import ru.itmo.backend.model.enums.DeletionRequestStatus;

import java.util.List;

public interface DeletionRequestRepository extends JpaRepository<DeletionRequest, Integer> {

    boolean existsByUser_IdAndStatus(Integer userId, DeletionRequestStatus status);

    List<DeletionRequest> findAllByUser_IdOrderByCreatedAtDesc(Integer userId);

    List<DeletionRequest> findAllByOrderByCreatedAtDesc();
}
package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.PaymentOperation;

import java.util.List;

public interface PaymentOperationRepository extends JpaRepository<PaymentOperation, Integer> {
    List<PaymentOperation> findAllByUser_IdOrderByCreatedAtDesc(Integer userId);
}
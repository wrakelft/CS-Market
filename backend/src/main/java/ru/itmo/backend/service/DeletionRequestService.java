package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.delete.DeletionRequestDto;
import ru.itmo.backend.dto.delete.RejectDeletionRequestDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.model.DeletionRequest;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.enums.DeletionRequestStatus;
import ru.itmo.backend.repository.DeletionRequestRepository;
import ru.itmo.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeletionRequestService {

    private final DeletionRequestRepository deletionRequestRepository;
    private final UserRepository userRepository;

    // 1) создать запрос на удаление
    @Transactional
    public DeletionRequestDto create(Integer userId) {
        if (userId == null || userId <= 0) throw new BadRequestException("userId must be > 0");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        // запрещаем второй PENDING запрос
        if (deletionRequestRepository.existsByUser_IdAndStatus(userId, DeletionRequestStatus.PENDING)) {
            throw new BadRequestException("Deletion request already exists (PENDING) for this user");
        }

        DeletionRequest req = new DeletionRequest();
        req.setUser(user);
        req.setStatus(DeletionRequestStatus.PENDING);
        req.setCreatedAt(LocalDateTime.now());

        return toDto(deletionRequestRepository.save(req));
    }

    // 2) список запросов конкретного пользователя
    @Transactional(readOnly = true)
    public List<DeletionRequestDto> getUserRequests(Integer userId) {
        if (userId == null || userId <= 0) throw new BadRequestException("userId must be > 0");

        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        return deletionRequestRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // 3) список всех запросов (для админа)
    @Transactional(readOnly = true)
    public List<DeletionRequestDto> getAll() {
        return deletionRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // 4) approve (только смена статуса)
    @Transactional
    public DeletionRequestDto approve(Integer requestId) {
        if (requestId == null || requestId <= 0) throw new BadRequestException("requestId must be > 0");

        DeletionRequest req = deletionRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("DeletionRequest not found: " + requestId));

        if (req.getStatus() != DeletionRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING request can be approved");
        }

        req.setStatus(DeletionRequestStatus.APPROVED);
        return toDto(deletionRequestRepository.save(req));
    }

    // 5) reject (только смена статуса, reason принять можем, но хранить негде)
    @Transactional
    public DeletionRequestDto reject(Integer requestId, RejectDeletionRequestDto body) {
        if (requestId == null || requestId <= 0) throw new BadRequestException("requestId must be > 0");

        // если хочешь строго требовать причину (даже если не храним) — оставь:
        if (body == null || body.getReason() == null || body.getReason().isBlank()) {
            throw new BadRequestException("reason is required");
        }

        DeletionRequest req = deletionRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("DeletionRequest not found: " + requestId));

        if (req.getStatus() != DeletionRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING request can be rejected");
        }

        req.setStatus(DeletionRequestStatus.REJECTED);
        return toDto(deletionRequestRepository.save(req));
    }

    private DeletionRequestDto toDto(DeletionRequest r) {
        return DeletionRequestDto.builder()
                .id(r.getId())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                // если в DTO status String — вот так:
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .createdAt(r.getCreatedAt())
                // reason/decidedAt НЕ трогаем (их нет в Entity/БД)
                .build();
    }
}
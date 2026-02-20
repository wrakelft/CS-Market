package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.delete.DeletionRequestDto;
import ru.itmo.backend.dto.delete.RejectDeletionRequestDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.exception.UnauthorizedException;
import ru.itmo.backend.model.DeletionRequest;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.enums.DeletionRequestStatus;
import ru.itmo.backend.repository.DeletionRequestRepository;
import ru.itmo.backend.repository.UserRepository;
import ru.itmo.backend.repository.UserSessionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeletionRequestService {

    private final DeletionRequestRepository deletionRequestRepository;
    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final AuthService authService;

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

    @Transactional
    public DeletionRequestDto approve(Integer requestId) {
        if (requestId == null || requestId <= 0) throw new BadRequestException("requestId must be > 0");

        DeletionRequest req = deletionRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("DeletionRequest not found: " + requestId));

        if (req.getStatus() != DeletionRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING request can be approved");
        }

        req.setStatus(DeletionRequestStatus.APPROVED);

        DeletionRequest saved = deletionRequestRepository.save(req);

        Integer userId = req.getUser().getId();
        userSessionRepository.deleteAllByUser_Id(userId);

        return toDto(saved);
    }

    @Transactional
    public DeletionRequestDto reject(Integer requestId, RejectDeletionRequestDto body) {
        if (requestId == null || requestId <= 0) throw new BadRequestException("requestId must be > 0");

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
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .createdAt(r.getCreatedAt())
                .build();
    }

    @Transactional
    public DeletionRequestDto cancelRequest(Integer requestId, String authHeader) {
        if (requestId == null || requestId <= 0) {
            throw new BadRequestException("requestId must be > 0");
        }

        User u = authService.requireUser(authHeader);

        DeletionRequest r = deletionRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Deletion request not found: " + requestId));

        if (r.getUser() == null || r.getUser().getId() == null || !r.getUser().getId().equals(u.getId())) {
            throw new UnauthorizedException("Not your deletion request");
        }

        if (r.getStatus() != DeletionRequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING request can be cancelled");
        }

        r.setStatus(DeletionRequestStatus.CANCELLED);

        return toDto(deletionRequestRepository.save(r));
    }
}
package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.CreatePaymentOperationRequest;
import ru.itmo.backend.dto.PaymentOperationDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.model.PaymentOperation;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.enums.PaymentMethod;
import ru.itmo.backend.model.enums.PaymentOperationType;
import ru.itmo.backend.model.enums.PaymentStatus;
import ru.itmo.backend.repository.PaymentOperationRepository;
import ru.itmo.backend.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentOperationRepository paymentOperationRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentOperationDto create(CreatePaymentOperationRequest req) {
        if (req.getUserId() == null || req.getUserId() <= 0) throw new BadRequestException("userId must be > 0");
        if (req.getAmount() == null || req.getAmount() <= 0) throw new BadRequestException("amount must be > 0");
        if (req.getType() == null || req.getType().isBlank()) throw new BadRequestException("type is required");
        if (req.getMethod() == null || req.getMethod().isBlank()) throw new BadRequestException("method is required");
        if (req.getStatus() == null || req.getStatus().isBlank()) throw new BadRequestException("status is required");

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found: " + req.getUserId()));

        PaymentOperation op = new PaymentOperation();
        op.setUser(user);
        op.setAmount(req.getAmount());

        op.setType(parseEnum(req.getType(), PaymentOperationType.class, "type"));
        op.setMethod(parseEnum(req.getMethod(), PaymentMethod.class, "method"));
        op.setStatus(parseEnum(req.getStatus(), PaymentStatus.class, "status"));

        PaymentOperation saved = paymentOperationRepository.save(op);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public PaymentOperationDto getById(Integer id) {
        if (id == null || id <= 0) throw new BadRequestException("id must be > 0");
        return paymentOperationRepository.findById(id).map(this::toDto)
                .orElseThrow(() -> new NotFoundException("PaymentOperation not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<PaymentOperationDto> getUserOperations(Integer userId) {
        if (userId == null || userId <= 0) throw new BadRequestException("userId must be > 0");
        userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found: " + userId));

        return paymentOperationRepository.findAllByUser_IdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public PaymentOperationDto updateStatus(Integer id, String status) {
        if (id == null || id <= 0) throw new BadRequestException("id must be > 0");
        if (status == null || status.isBlank()) throw new BadRequestException("status is required");

        PaymentOperation op = paymentOperationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("PaymentOperation not found: " + id));

        op.setStatus(parseEnum(status, PaymentStatus.class, "status"));
        return toDto(paymentOperationRepository.save(op));
    }

    @Transactional
    public void delete(Integer id) {
        if (id == null || id <= 0) throw new BadRequestException("id must be > 0");
        if (!paymentOperationRepository.existsById(id))
            throw new NotFoundException("PaymentOperation not found: " + id);
        paymentOperationRepository.deleteById(id);
    }

    private PaymentOperationDto toDto(PaymentOperation op) {
        return PaymentOperationDto.builder()
                .id(op.getId())
                .type(op.getType() != null ? op.getType().name() : null)
                .method(op.getMethod() != null ? op.getMethod().name() : null)
                .status(op.getStatus() != null ? op.getStatus().name() : null)
                .amount(op.getAmount())
                .createdAt(op.getCreatedAt())
                .userId(op.getUser() != null ? op.getUser().getId() : null)
                .build();
    }

    private <E extends Enum<E>> E parseEnum(String raw, Class<E> enumClass, String fieldName) {
        String val = raw.trim().toUpperCase();
        try {
            return Enum.valueOf(enumClass, val);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid " + fieldName + ": " + raw);
        }
    }
}
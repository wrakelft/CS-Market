package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.CreatePaymentOperationRequest;
import ru.itmo.backend.dto.PaymentOperationDto;
import ru.itmo.backend.service.PaymentService;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public PaymentOperationDto create(@RequestBody CreatePaymentOperationRequest req) {
        return paymentService.create(req);
    }

    @GetMapping("/{id}")
    public PaymentOperationDto getById(@PathVariable Integer id) {
        return paymentService.getById(id);
    }

    @GetMapping
    public List<PaymentOperationDto> getUserOperations(@RequestParam Integer userId) {
        return paymentService.getUserOperations(userId);
    }

    @PatchMapping("/{id}/status")
    public PaymentOperationDto updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return paymentService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Integer id) {
        paymentService.delete(id);
        return Map.of("result", "ok");
    }
}
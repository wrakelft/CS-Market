package ru.itmo.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.itmo.backend.exception.NotFoundException;

@RestController
public class HealthController {
    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/test-error")
    public String testError() {
        throw new NotFoundException("Test: not found");
    }
}

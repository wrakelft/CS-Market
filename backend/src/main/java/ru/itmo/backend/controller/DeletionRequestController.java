package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.delete.CreateDeletionRequestDto;
import ru.itmo.backend.dto.delete.DeletionRequestDto;
import ru.itmo.backend.service.DeletionRequestService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/deletion-requests")
public class DeletionRequestController {

    private final DeletionRequestService deletionRequestService;

    @PostMapping
    public DeletionRequestDto create(@Valid @RequestBody CreateDeletionRequestDto dto) {
        return deletionRequestService.create(dto.getUserId());
    }

    // GET /deletion-requests?userId=1
    @GetMapping
    public List<DeletionRequestDto> getUser(@RequestParam Integer userId) {
        return deletionRequestService.getUserRequests(userId);
    }
}
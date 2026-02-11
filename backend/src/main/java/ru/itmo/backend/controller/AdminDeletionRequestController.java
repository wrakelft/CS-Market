package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.delete.DeletionRequestDto;
import ru.itmo.backend.dto.delete.RejectDeletionRequestDto;
import ru.itmo.backend.service.DeletionRequestService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/deletion-requests")
public class AdminDeletionRequestController {

    private final DeletionRequestService deletionRequestService;

    // GET /admin/deletion-requests
    @GetMapping
    public List<DeletionRequestDto> list() {
        return deletionRequestService.getAll();
    }

    // POST /admin/deletion-requests/{id}/approve
    @PostMapping("/{id}/approve")
    public DeletionRequestDto approve(@PathVariable Integer id) {
        return deletionRequestService.approve(id);
    }

    // POST /admin/deletion-requests/{id}/reject
    @PostMapping("/{id}/reject")
    public DeletionRequestDto reject(@PathVariable Integer id,
                                     @Valid @RequestBody RejectDeletionRequestDto body) {
        return deletionRequestService.reject(id, body);
    }
}
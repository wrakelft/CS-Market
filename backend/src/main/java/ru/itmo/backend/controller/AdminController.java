package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.CleanupResponseDto;
import ru.itmo.backend.dto.instant.InstantBuyPriceDto;
import ru.itmo.backend.dto.instant.InstantBuyPriceUpsertRequestDto;
import ru.itmo.backend.dto.delete.DeletionRequestDto;
import ru.itmo.backend.dto.delete.RejectDeletionRequestDto;
import ru.itmo.backend.dto.ticket.TicketDto;
import ru.itmo.backend.dto.user.AdminUserDto;
import ru.itmo.backend.exception.UnauthorizedException;
import ru.itmo.backend.model.User;
import ru.itmo.backend.model.enums.UserRole;
import ru.itmo.backend.service.AdminService;
import ru.itmo.backend.service.AuthService;
import ru.itmo.backend.service.DeletionRequestService;
import ru.itmo.backend.service.SupportService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;
    private final DeletionRequestService deletionRequestService;
    private final SupportService supportService;

    private void requireAdmin(String authHeader) {
        User u = authService.requireUser(authHeader);
        if (u.getRole() != UserRole.ADMIN) throw new UnauthorizedException("Admin only");
    }

    @GetMapping("/users")
    public List<AdminUserDto> users(@RequestHeader(value="Authorization", required=false) String authHeader) {
        adminService.requireAdmin(authHeader);
        return adminService.getUsers();
    }

    @PatchMapping("/users/{userId}/role")
    public AdminUserDto setRole(@PathVariable Integer userId,
                                @RequestParam String role,
                                @RequestHeader(value="Authorization", required=false) String authHeader) {
        adminService.requireAdmin(authHeader);
        return adminService.setUserRole(userId, role);
    }

    @GetMapping("/deletion-requests")
    public List<DeletionRequestDto> all(@RequestHeader(value="Authorization", required=false) String authHeader) {
        requireAdmin(authHeader);
        return deletionRequestService.getAll();
    }

    @PatchMapping("/deletion-requests/{id}/approve")
    public DeletionRequestDto approve(@PathVariable Integer id,
                                      @RequestHeader(value="Authorization", required=false) String authHeader) {
        requireAdmin(authHeader);
        return deletionRequestService.approve(id);
    }

    @PatchMapping("/deletion-requests/{id}/reject")
    public DeletionRequestDto reject(@PathVariable Integer id,
                                     @RequestBody RejectDeletionRequestDto body,
                                     @RequestHeader(value="Authorization", required=false) String authHeader) {
        requireAdmin(authHeader);
        return deletionRequestService.reject(id, body);
    }

    @PostMapping("/cleanup-reservations")
    public CleanupResponseDto cleanup() {
        int cleared = adminService.cleanupExpiredReservations();
        return CleanupResponseDto.builder()
                .cleared(cleared)
                .build();
    }

    @PostMapping("/instant-prices")
    public InstantBuyPriceDto upsert(@Valid @RequestBody InstantBuyPriceUpsertRequestDto dto,
                                     @RequestHeader(value="Authorization", required=false) String authHeader) {

        User admin = authService.requireUser(authHeader);
        if (admin.getRole() != UserRole.ADMIN) throw new UnauthorizedException("Admin only");

        return adminService.upsertInstantBuyPrice(dto.getSkinId(), admin.getId(), dto.getPrice());
    }

    @GetMapping("/tickets")
    public List<TicketDto> tickets(@RequestHeader(value="Authorization", required=false) String authHeader) {
        adminService.requireAdmin(authHeader);
        return supportService.getAllTickets();
    }

    @PatchMapping("/tickets/{id}/status")
    public TicketDto setTicketStatus(@PathVariable Integer id,
                                     @RequestParam String status,
                                     @RequestHeader(value="Authorization", required=false) String authHeader) {
        adminService.requireAdmin(authHeader);
        return supportService.setTicketStatus(id, status);
    }
}
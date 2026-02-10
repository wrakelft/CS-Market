package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.CreateTicketRequest;
import ru.itmo.backend.dto.TicketDto;
import ru.itmo.backend.service.SupportService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/support")
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/tickets")
    public TicketDto createTicket(@RequestBody CreateTicketRequest req) {
        return supportService.createTicket(req);
    }

    @GetMapping("/tickets")
    public List<TicketDto> getUserTickets(@RequestParam Integer userId) {
        return supportService.getUserTickets(userId);
    }
}
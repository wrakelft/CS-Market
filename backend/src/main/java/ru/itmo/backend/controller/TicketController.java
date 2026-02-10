package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.ticket.AttachmentDto;
import ru.itmo.backend.dto.ticket.CreateTicketRequest;
import ru.itmo.backend.dto.ticket.TicketDto;
import ru.itmo.backend.service.SupportService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tickets")
public class TicketController {

    private final SupportService supportService;

    // POST /tickets
    @PostMapping
    public TicketDto create(@Valid @RequestBody CreateTicketRequest req) {
        return supportService.createTicket(req);
    }

    // GET /tickets?userId=1
    @GetMapping
    public List<TicketDto> getTickets(@RequestParam Integer userId) {
        return supportService.getUserTickets(userId);
    }

    // GET /tickets/{ticketId}/attachments
    @GetMapping("/{ticketId}/attachments")
    public List<AttachmentDto> getAttachments(@PathVariable Integer ticketId) {
        return supportService.getTicketAttachments(ticketId);
    }

    // POST /tickets/{ticketId}/attachments
    @PostMapping("/{ticketId}/attachments")
    public AttachmentDto addAttachment(@PathVariable Integer ticketId,
                                       @Valid @RequestBody AttachmentDto req) {
        return supportService.addAttachment(ticketId, req);
    }

    // DELETE /tickets/attachments/{attachmentId}
    @DeleteMapping("/attachments/{attachmentId}")
    public void deleteAttachment(@PathVariable Integer attachmentId) {
        supportService.deleteAttachment(attachmentId);
    }
}
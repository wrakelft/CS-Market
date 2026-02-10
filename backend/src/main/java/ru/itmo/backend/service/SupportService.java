package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.AttachmentDto;
import ru.itmo.backend.dto.CreateTicketRequest;
import ru.itmo.backend.dto.TicketDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.model.Attachment;
import ru.itmo.backend.model.Ticket;
import ru.itmo.backend.model.User;
import ru.itmo.backend.repository.AttachmentRepository;
import ru.itmo.backend.repository.TicketRepository;
import ru.itmo.backend.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final TicketRepository ticketRepository;
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public TicketDto createTicket(CreateTicketRequest req) {
        if (req.getUserId() == null || req.getUserId() <= 0) throw new BadRequestException("userId must be > 0");
        if (req.getTopic() == null || req.getTopic().isBlank()) throw new BadRequestException("topic is required");
        if (req.getDescription() == null || req.getDescription().isBlank()) throw new BadRequestException("description is required");

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found: " + req.getUserId()));

        Ticket ticket = new Ticket();
        ticket.setTopic(req.getTopic().trim());
        ticket.setDescription(req.getDescription().trim());
        ticket.setUser(user);

        Ticket saved = ticketRepository.save(ticket);

        // attachments (опционально)
        List<AttachmentDto> outAttachments = new ArrayList<>();
        if (req.getAttachments() != null) {
            for (var a : req.getAttachments()) {
                if (a == null) continue;
                if (a.getFileName() == null || a.getFileName().isBlank())
                    throw new BadRequestException("attachment.fileName is required");
                if (a.getFileUrl() == null || a.getFileUrl().isBlank())
                    throw new BadRequestException("attachment.fileUrl is required");

                Attachment att = new Attachment();
                att.setFileName(a.getFileName().trim());
                att.setFileUrl(a.getFileUrl().trim());
                att.setTicket(saved);

                Attachment attSaved = attachmentRepository.save(att);

                outAttachments.add(AttachmentDto.builder()
                        .id(attSaved.getId())
                        .fileName(attSaved.getFileName())
                        .fileUrl(attSaved.getFileUrl())
                        .build());
            }
        }

        return TicketDto.builder()
                .id(saved.getId())
                .topic(saved.getTopic())
                .description(saved.getDescription())
                .userId(user.getId())
                .createdAt(saved.getCreatedAt())
                .closedAt(saved.getClosedAt())
                .attachments(outAttachments)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TicketDto> getUserTickets(Integer userId) {
        if (userId == null || userId <= 0) throw new BadRequestException("userId must be > 0");

        // чтобы сразу отдать NotFound если юзера нет
        userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found: " + userId));

        List<Ticket> tickets = ticketRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);

        List<TicketDto> result = new ArrayList<>();
        for (Ticket t : tickets) {
            List<Attachment> atts = attachmentRepository.findAllByTicket_Id(t.getId());

            List<AttachmentDto> attDtos = atts.stream()
                    .map(a -> AttachmentDto.builder()
                            .id(a.getId())
                            .fileName(a.getFileName())
                            .fileUrl(a.getFileUrl())
                            .build())
                    .toList();

            result.add(TicketDto.builder()
                    .id(t.getId())
                    .topic(t.getTopic())
                    .description(t.getDescription())
                    .userId(userId)
                    .createdAt(t.getCreatedAt())
                    .closedAt(t.getClosedAt())
                    .attachments(attDtos)
                    .build());
        }

        return result;
    }
}
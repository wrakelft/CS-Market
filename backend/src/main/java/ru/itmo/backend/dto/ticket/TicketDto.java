package ru.itmo.backend.dto.ticket;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TicketDto {
    private Integer id;
    private String topic;
    private String description;
    private Integer userId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private List<AttachmentDto> attachments;
}
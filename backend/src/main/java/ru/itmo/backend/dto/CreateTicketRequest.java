package ru.itmo.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateTicketRequest {
    private Integer userId;
    private String topic;
    private String description;
    private List<AttachmentDto> attachments; // optional
}
package ru.itmo.backend.dto.ticket;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateTicketRequest {

    @NotNull @Min(1)
    private Integer userId;

    @NotBlank
    private String topic;

    @NotBlank
    private String description;

    @Valid
    private List<AttachmentDto> attachments; // optional
}
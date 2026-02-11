package ru.itmo.backend.dto.delete;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectDeletionRequestDto {
    @NotBlank
    private String reason;
}
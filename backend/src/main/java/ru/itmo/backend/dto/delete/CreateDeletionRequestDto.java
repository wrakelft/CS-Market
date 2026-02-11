package ru.itmo.backend.dto.delete;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDeletionRequestDto {
    @NotNull @Min(1)
    private Integer userId;
}
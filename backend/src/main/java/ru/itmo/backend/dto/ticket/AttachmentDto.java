package ru.itmo.backend.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AttachmentDto {
    private Integer id;

    @NotBlank
    private String fileName;

    @NotBlank
    private String fileUrl;
}
package ru.itmo.backend.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AttachmentDto {
    private Integer id;
    private String fileName;
    private String fileUrl;
}
package ru.itmo.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SteamLoginRequestDto {

    @NotBlank
    @Size(max = 64)
    private String steamId;

    @Size(max = 64)
    private String nickname;
}

package ru.itmo.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegisterRequestDto {
    @NotBlank
    @Size(max = 64)
    private String steamId;

    @NotBlank
    @Size(max = 64)
    private String nickname;

    @NotBlank
    @Size(min = 6, max = 64)
    private String password;
}
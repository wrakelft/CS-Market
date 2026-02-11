package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.auth.AuthUserDto;
import ru.itmo.backend.dto.auth.SteamLoginRequestDto;
import ru.itmo.backend.service.AuthService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/steam")
    public AuthUserDto steamLogin(@Valid @RequestBody SteamLoginRequestDto req) {
        return authService.loginOrRegister(req);
    }
}

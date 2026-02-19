package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.inventory.InventoryItemDto;
import ru.itmo.backend.dto.user.UserProfileDto;
import ru.itmo.backend.service.InventoryService;
import ru.itmo.backend.service.UserService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final InventoryService inventoryService;
    private final UserService userService;

    // BE-5: read-model профиля/баланса
    @GetMapping("/{userId}")
    public UserProfileDto getUser(@PathVariable Integer userId) {
        return userService.getUserProfile(userId);
    }

    @GetMapping("/{userId}/inventory")
    public List<InventoryItemDto> getInventory(@PathVariable Integer userId) {
        return inventoryService.getUserInventory(userId);
    }
}
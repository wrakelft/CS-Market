package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.inventory.InventoryItemDto;
import ru.itmo.backend.service.InventoryService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final InventoryService inventoryService;

    @GetMapping("/{userId}/inventory")
    public List<InventoryItemDto> getInventory(@PathVariable Integer userId) {
        return inventoryService.getUserInventory(userId);
    }
}

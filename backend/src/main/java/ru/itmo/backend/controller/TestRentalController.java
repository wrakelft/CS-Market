package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.rental.RentResult;
import ru.itmo.backend.service.RentalService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class TestRentalController {

    private final RentalService rentalService;

    // POST /test/rent?renterId=1&announcementId=2&days=3
    @PostMapping("/rent")
    public RentResult rent(@RequestParam Integer renterId,
                           @RequestParam Integer announcementId,
                           @RequestParam Integer days) {
        return rentalService.rentSkin(renterId, announcementId, days);
    }
}
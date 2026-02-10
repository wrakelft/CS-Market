package ru.itmo.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.rental.RentalListingDto;
import ru.itmo.backend.service.RentalListingService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/listings")
public class RentalListingController {

    private final RentalListingService rentalListingService;

    @GetMapping("/rent")
    public List<RentalListingDto> getRentListings() {
        return rentalListingService.getAllListings();
    }
}
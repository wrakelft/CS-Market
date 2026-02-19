package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.rental.CreateRentalListingRequestDto;
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

    @PostMapping("/rent")
    public RentalListingDto createRentListing(@Valid @RequestBody CreateRentalListingRequestDto request) {
        return rentalListingService.createListing(request);
    }
}
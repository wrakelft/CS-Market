package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.rental.CreateRentalListingRequestDto;
import ru.itmo.backend.dto.rental.RentalListingDto;
import ru.itmo.backend.service.RentalListingService;
import ru.itmo.backend.service.RentalService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/listings")
public class RentalListingController {

    private final RentalListingService rentalListingService;
    private final RentalService rentalService;

    @GetMapping("/rent")
    public List<RentalListingDto> getRentListings(@RequestParam(required = false) Integer ownerId) {
        return rentalListingService.getListings(ownerId);
    }

    @PostMapping("/rent")
    public RentalListingDto createRentListing(@Valid @RequestBody CreateRentalListingRequestDto request) {
        return rentalListingService.createListing(request);
    }

    @GetMapping("/listings/rent")
    public List<RentalListingDto> listRent(@RequestParam(required = false) Integer ownerId) {
        rentalService.cleanupExpiredRentals();

        return rentalService.getAvailableListings(ownerId);
    }
}
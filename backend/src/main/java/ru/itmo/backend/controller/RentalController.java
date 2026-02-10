package ru.itmo.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.itmo.backend.dto.rental.RentRequestDto;
import ru.itmo.backend.dto.rental.RentResponseDto;
import ru.itmo.backend.dto.RentResult;
import ru.itmo.backend.service.RentalService;

@RestController
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/rent")
    public RentResponseDto rent(@Valid @RequestBody RentRequestDto req) {
        RentResult result = rentalService.rentSkin(req.getRenterId(), req.getAnnouncementId(), req.getDays());

        return RentResponseDto.builder()
                .success(result.isSuccess())
                .message(result.getMessage())
                .rentalContractId(result.getRentalContractId())
                .totalCost(result.getTotalCost())
                .build();
    }
}
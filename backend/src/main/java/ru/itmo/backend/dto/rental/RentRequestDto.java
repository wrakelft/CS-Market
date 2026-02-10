package ru.itmo.backend.dto.rental;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RentRequestDto {

    @NotNull @Min(1)
    private Integer renterId;

    @NotNull @Min(1)
    private Integer announcementId; // это rental_listings.id

    @NotNull @Min(1) @Max(365)
    private Integer days;
}
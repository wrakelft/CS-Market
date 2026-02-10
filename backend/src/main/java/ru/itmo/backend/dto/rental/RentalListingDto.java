package ru.itmo.backend.dto.rental;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RentalListingDto {
    private Integer listingId;
    private Integer pricePerDay;
    private Integer maxDays;

    private Integer skinId;
    private String skinName;

    private Integer ownerId;
}
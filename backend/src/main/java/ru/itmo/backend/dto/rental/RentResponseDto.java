package ru.itmo.backend.dto.rental;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RentResponseDto {
    private Boolean success;
    private String message;
    private Integer rentalContractId;
    private Integer totalCost;
}
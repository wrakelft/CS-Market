package ru.itmo.backend.dto.rental;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RentResult {
    boolean success;
    String message;
    Integer rentalContractId;
    Integer totalCost;
}
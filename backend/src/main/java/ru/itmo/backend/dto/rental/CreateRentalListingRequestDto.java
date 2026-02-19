package ru.itmo.backend.dto.rental;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRentalListingRequestDto {

    @NotNull @Min(1)
    private Integer ownerId;

    @NotNull @Min(1)
    private Integer inventoryItemId;

    @NotNull @Min(1)
    private Integer pricePerDay;

    @NotNull @Min(1) @Max(365)
    private Integer maxDays;

    // Если потом добавите поле в БД — просто раскомментите
    // @Min(0)
    // private Integer deposit;

    // Если потом добавите minDays в БД — можно будет тоже
    // @Min(1) @Max(365)
    // private Integer minDays;
}
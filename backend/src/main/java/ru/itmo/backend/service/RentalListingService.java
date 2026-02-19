package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.rental.RentalListingDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.model.RentalListing;
import ru.itmo.backend.repository.RentalListingRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalListingService {

    private final RentalListingRepository rentalListingRepository;

    @Transactional(readOnly = true)
    public List<RentalListingDto> getListings(Integer ownerId) {
        if (ownerId == null) {
            return rentalListingRepository.findAll().stream()
                    .map(this::toDto)
                    .toList();
        }
        if (ownerId <= 0) {
            throw new BadRequestException("ownerId must be positive");
        }

        return rentalListingRepository.findByInventoryItem_User_Id(ownerId).stream()
                .map(this::toDto)
                .toList();
    }

    private RentalListingDto toDto(RentalListing rl) {
        return RentalListingDto.builder()
                .listingId(rl.getId())
                .pricePerDay(rl.getPricePerDay())
                .maxDays(rl.getMaxDays())
                .skinId(rl.getInventoryItem().getSkin().getId())
                .skinName(rl.getInventoryItem().getSkin().getName())
                .ownerId(rl.getInventoryItem().getUser().getId())
                .build();
    }
}
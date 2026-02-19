package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.rental.CreateRentalListingRequestDto;
import ru.itmo.backend.dto.rental.RentalListingDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.model.InventoryItem;
import ru.itmo.backend.model.RentalListing;
import ru.itmo.backend.model.enums.OwnershipFlag;
import ru.itmo.backend.model.enums.SaleListingStatus;
import ru.itmo.backend.repository.InventoryItemRepository;
import ru.itmo.backend.repository.RentalListingRepository;
import ru.itmo.backend.repository.SaleListingRepository;
import ru.itmo.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalListingService {

    private final RentalListingRepository rentalListingRepository;

    // для проверок
    private final InventoryItemRepository inventoryItemRepository;
    private final SaleListingRepository saleListingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RentalListingDto> getAllListings() {
        return rentalListingRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public RentalListingDto createListing(CreateRentalListingRequestDto req) {
        // базовая валидация (на всякий, даже если @Valid стоит в контроллере)
        if (req.getOwnerId() == null || req.getOwnerId() <= 0) {
            throw new BadRequestException("ownerId must be positive");
        }
        if (req.getInventoryItemId() == null || req.getInventoryItemId() <= 0) {
            throw new BadRequestException("inventoryItemId must be positive");
        }
        if (req.getPricePerDay() == null || req.getPricePerDay() <= 0) {
            throw new BadRequestException("pricePerDay must be positive");
        }
        if (req.getMaxDays() == null || req.getMaxDays() <= 0) {
            throw new BadRequestException("maxDays must be positive");
        }

        // пользователь существует?
        if (!userRepository.existsById(req.getOwnerId())) {
            throw new NotFoundException("User not found");
        }

        // inventory item существует?
        InventoryItem item = inventoryItemRepository.findById(req.getInventoryItemId())
                .orElseThrow(() -> new NotFoundException("Inventory item not found"));

        // принадлежит пользователю?
        if (item.getUser() == null || !req.getOwnerId().equals(item.getUser().getId())) {
            throw new BadRequestException("Inventory item does not belong to user");
        }

        // предмет должен быть OWNED
        if (item.getOwnershipFlag() != OwnershipFlag.OWNED) {
            throw new BadRequestException("Inventory item is not owned");
        }

        // нельзя если уже в продаже (ACTIVE/RESERVED)
        boolean inSale =
                saleListingRepository.findFirstByInventoryItemIdAndStatus(item.getId(), SaleListingStatus.ACTIVE).isPresent()
                        || saleListingRepository.findFirstByInventoryItemIdAndStatus(item.getId(), SaleListingStatus.RESERVED).isPresent();

        if (inSale) {
            throw new BadRequestException("Inventory item is already in sale listing");
        }

        // нельзя если уже выставлен в аренду
        if (rentalListingRepository.existsByInventoryItemId(item.getId())) {
            throw new BadRequestException("Inventory item is already in rental listing");
        }

        // создаём listing
        RentalListing listing = RentalListing.builder()
                .pricePerDay(req.getPricePerDay())
                .maxDays(req.getMaxDays())
                .createdAt(LocalDateTime.now())
                .inventoryItem(item)
                .build();

        RentalListing saved = rentalListingRepository.save(listing);

        return toDto(saved);
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
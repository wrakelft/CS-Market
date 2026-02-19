package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dto.inventory.InventoryItemDto;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.NotFoundException;
import ru.itmo.backend.mapper.InventoryItemMapper;
import ru.itmo.backend.model.InventoryItem;
import ru.itmo.backend.model.enums.OwnershipFlag;
import ru.itmo.backend.model.enums.SaleListingStatus;
import ru.itmo.backend.repository.InventoryItemRepository;
import ru.itmo.backend.repository.RentalListingRepository;
import ru.itmo.backend.repository.SaleListingRepository;
import ru.itmo.backend.repository.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;
    private final SaleListingRepository saleListingRepository;
    private final RentalListingRepository rentalListingRepository;
    private final InventoryItemMapper inventoryItemMapper;


    @Transactional(readOnly = true)
    public List<InventoryItemDto> getUserInventory(Integer userId) {
        if (userId == null || userId <= 0) {
            throw new BadRequestException("userId must be positive");
        }
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found");
        }
        List<InventoryItem> items = inventoryItemRepository.findByUserId(userId);
        if (items.isEmpty()) return List.of();

        List<Integer> ids = items.stream().map(InventoryItem::getId).toList();

        Set<Integer> busy = new HashSet<>();

        busy.addAll(saleListingRepository.findBusyInventoryItemsIds(
                ids,
                List.of(SaleListingStatus.ACTIVE, SaleListingStatus.RESERVED)
        ));

        busy.addAll(rentalListingRepository.findBusyInventoryItemIds(ids));

        return items.stream().map(item -> {
            boolean tradable = item.getOwnershipFlag() == OwnershipFlag.OWNED
                    && !busy.contains(item.getId());
            return inventoryItemMapper.toDto(item, tradable);
        }).toList();
    }
}

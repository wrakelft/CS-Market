package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.itmo.backend.dao.RentalDao;
import ru.itmo.backend.dto.RentResult;
import ru.itmo.backend.exception.BadRequestException;
import ru.itmo.backend.exception.InsufficientFundsException;
import ru.itmo.backend.exception.NotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalDao rentalDao;

    @Transactional
    public RentResult rentSkin(Integer renterId, Integer announcementId, Integer days) {
        // ✅ Валидация входных
        if (renterId == null || renterId <= 0) {
            throw new BadRequestException("renterId must be > 0");
        }
        if (announcementId == null || announcementId <= 0) {
            throw new BadRequestException("announcementId must be > 0");
        }
        if (days == null || days <= 0) {
            throw new BadRequestException("days must be > 0");
        }

        RentResult result = rentalDao.rentSkin(renterId, announcementId, days);

        // ✅ Если процедура вернула ошибку — превращаем в исключение
        if (!result.isSuccess()) {
            String msg = result.getMessage() == null ? "Rent failed" : result.getMessage().toLowerCase();

            if (msg.contains("not found")) {
                throw new NotFoundException(result.getMessage());
            }
            if (msg.contains("insufficient") || msg.contains("недостаточно")) {
                throw new InsufficientFundsException(result.getMessage());
            }

            // все остальное — bad request (или можно Conflict)
            throw new BadRequestException(result.getMessage());
        }

        return result;
    }
}
package ru.itmo.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.itmo.backend.dao.RentalDao;
import ru.itmo.backend.dto.RentResult;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalDao rentalDao;

    public RentResult rentSkin(Integer renterId, Integer rentalAnnouncementId, Integer rentalDays) {
        return rentalDao.rentSkin(renterId, rentalAnnouncementId, rentalDays);
    }

    public int cleanupExpiredReservations() {
        return rentalDao.cleanupExpiredReservations();
    }
}
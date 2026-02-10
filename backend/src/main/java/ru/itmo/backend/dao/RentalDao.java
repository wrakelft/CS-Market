package ru.itmo.backend.dao;

import ru.itmo.backend.dto.RentResult;

public interface RentalDao {
    RentResult rentSkin(Integer renterId, Integer rentalAnnouncementId, Integer rentalDays);
    int cleanupExpiredReservations();
}
package ru.itmo.backend.jobs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.backend.dao.CleanupDao;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationCleanupScheduler {

    private final CleanupDao dao;

    @Scheduled(fixedDelayString = "${app.reservations.cleanupDelayMs:30000}")
    @Transactional
    public void run() {
        int cleared = dao.cleanupExpiredReservations();
        if (cleared > 0) {
            log.info("cleanup_expired_reservations cleared {}", cleared);
        }
    }
}
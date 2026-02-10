package ru.itmo.backend.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CleanupDao {

    private final JdbcTemplate jdbcTemplate;

    public CleanupDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int cleanupExpiredReservations() {
        Integer cleared = jdbcTemplate.queryForObject(
                "SELECT cleanup_expired_reservations()",
                Integer.class
        );
        return cleared == null ? 0 : cleared;
    }
}
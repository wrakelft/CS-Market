package ru.itmo.backend.dao;

import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import ru.itmo.backend.dto.rental.RentResult;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Types;

@Repository
public class RentalDao {

    private final JdbcTemplate jdbcTemplate;

    public RentalDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public RentResult rentSkin(Integer renterId, Integer rentalAnnouncementId, Integer rentalDays) {

        CallableStatementCreator csc = (Connection con) -> {
            CallableStatement cs = con.prepareCall("CALL rent_skin(?, ?, ?, ?, ?, ?, ?)");
            cs.setInt(1, renterId);
            cs.setInt(2, rentalAnnouncementId);
            cs.setInt(3, rentalDays);

            cs.registerOutParameter(4, Types.BOOLEAN);
            cs.registerOutParameter(5, Types.VARCHAR);
            cs.registerOutParameter(6, Types.INTEGER);
            cs.registerOutParameter(7, Types.INTEGER);
            return cs;
        };

        return jdbcTemplate.execute(csc, (CallableStatement cs) -> {
            cs.execute();

            return RentResult.builder()
                    .success(cs.getBoolean(4))
                    .message(cs.getString(5))
                    .rentalContractId((Integer) cs.getObject(6))
                    .totalCost((Integer) cs.getObject(7))
                    .build();
        });
    }

    public int cleanupExpiredRentals() {
        Integer n = jdbcTemplate.queryForObject("SELECT cleanup_expired_rentals()", Integer.class);
        return n == null ? 0 : n;
    }

    public java.util.List<ru.itmo.backend.dto.rental.RentalListingDto> getAvailableRentalListings(Integer ownerId) {
        String sql = """
        SELECT
            rl.id        AS listing_id,
            rl.price_per_day,
            rl.max_days,
            s.id         AS skin_id,
            s.name       AS skin_name,
            ii.user_id   AS owner_id
        FROM rental_listings rl
        JOIN inventory_items ii ON ii.id = rl.inventory_item_id
        JOIN skins s ON s.id = ii.skin_id
        WHERE (? IS NULL OR ii.user_id = ?)
          AND NOT EXISTS (
              SELECT 1
              FROM rental_contracts rc
              WHERE rc.rental_listing_id = rl.id
                AND rc.status = 'ACTIVE'
                AND rc.end_at > NOW()
          )
        ORDER BY rl.id DESC
        """;

        return jdbcTemplate.query(sql, ps -> {
            ps.setObject(1, ownerId);
            ps.setObject(2, ownerId);
        }, (rs, rowNum) -> ru.itmo.backend.dto.rental.RentalListingDto.builder()
                .listingId(rs.getInt("listing_id"))
                .pricePerDay(rs.getInt("price_per_day"))
                .maxDays(rs.getInt("max_days"))
                .skinId(rs.getInt("skin_id"))
                .skinName(rs.getString("skin_name"))
                .ownerId(rs.getInt("owner_id"))
                .build());
    }


}
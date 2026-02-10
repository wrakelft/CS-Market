package ru.itmo.backend.dao;

import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import ru.itmo.backend.dto.RentResult;

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
}
package ru.itmo.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbPingRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbPingRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        Integer one = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        System.out.println("DB PING: " + one);
    }
}

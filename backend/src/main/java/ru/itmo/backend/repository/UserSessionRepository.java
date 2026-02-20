package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
}
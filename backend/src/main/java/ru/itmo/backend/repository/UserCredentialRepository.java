package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.UserCredential;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Integer> {
}
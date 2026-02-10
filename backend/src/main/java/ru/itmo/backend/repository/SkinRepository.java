package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.itmo.backend.model.Skin;

public interface SkinRepository extends JpaRepository<Skin, Integer> {
}

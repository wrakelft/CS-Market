package ru.itmo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import ru.itmo.backend.model.Skin;

public interface SkinRepository extends JpaRepository<Skin, Integer>, JpaSpecificationExecutor<Skin> {
}

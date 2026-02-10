package ru.itmo.backend.repository.spec;

import org.springframework.data.jpa.domain.Specification;
import ru.itmo.backend.model.Skin;

public final class SkinSpecifications {

    private SkinSpecifications() {}

    public static Specification<Skin> nameContains(String q) {
        if (q == null || q.isBlank()) return null;
        String like = "%" + q.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), like);
    }

    public static Specification<Skin> hasCollection(String collection) {
        if (collection == null || collection.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("collection"), collection.trim());
    }

    public static Specification<Skin> hasRarity(String rarity) {
        if (rarity == null || rarity.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("rarity"), rarity.trim());
    }

    public static Specification<Skin> hasCondition(String condition) {
        if (condition == null || condition.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("condition"), condition.trim());
    }
}

package ru.itmo.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "skins")
public class Skin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 64)
    private String name;

    @Column(name = "collection", nullable = false, length = 64)
    private String collection;

    @Column(name = "rarity", nullable = false, length = 64)
    private String rarity;

    @Column(name = "description", nullable = false, length = 512)
    private String description;

    @Column(name = "condition", nullable = false, length = 64)
    private String condition;

    @OneToMany(mappedBy = "skin", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SkinPriceHistory> priceHistory = new ArrayList<>();

    @OneToMany(mappedBy = "skin", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InstantBuyPrice> instantPrices = new ArrayList<>();
}

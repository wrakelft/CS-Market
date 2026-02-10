package ru.itmo.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "skin_price_history")
public class SkinPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skin_id", nullable = false)
    private Skin skin;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}

package com.example.shop.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attribute extends BaseAuditEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_filterable")
    private Boolean isFilterable = true;

    @Column(name = "is_pricing")
    private Boolean isPricing = false;

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttributeValue> values;

}

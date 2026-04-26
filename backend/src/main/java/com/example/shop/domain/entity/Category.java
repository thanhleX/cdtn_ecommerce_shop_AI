package com.example.shop.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Column(length = 100)
    private String name;

    @Column(unique = true, length = 150)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private java.util.List<Category> children = new java.util.ArrayList<>();

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToMany
    @JoinTable(
        name = "category_attributes",
        joinColumns = @JoinColumn(name = "category_id"),
        inverseJoinColumns = @JoinColumn(name = "attribute_id")
    )
    private java.util.List<Attribute> attributes = new java.util.ArrayList<>();

}

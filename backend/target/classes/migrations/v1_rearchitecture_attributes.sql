-- Migration: Re-architecture Product Attributes
-- Date: 2026-04-26

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tạo bảng attributes (Lưu tên thuộc tính: RAM, Màu sắc, CPU...)
CREATE TABLE IF NOT EXISTS attributes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_filterable BOOLEAN DEFAULT TRUE,
    display_type ENUM('BUTTON', 'COLOR', 'DROPDOWN') DEFAULT 'BUTTON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- 2. Tạo bảng attribute_values (Lưu giá trị cụ thể: 8GB, Đen, i7...)
CREATE TABLE IF NOT EXISTS attribute_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attribute_id BIGINT NOT NULL,
    value VARCHAR(255) NOT NULL,
    CONSTRAINT fk_attr_val_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 3. Tạo bảng category_attributes (Gán thuộc tính nào thuộc danh mục nào để làm Filter)
CREATE TABLE IF NOT EXISTS category_attributes (
    category_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    PRIMARY KEY (category_id, attribute_id),
    CONSTRAINT fk_cat_attr_cat FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT fk_cat_attr_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 4. Tạo bảng variant_values (Liên kết Biến thể với Giá trị thuộc tính cụ thể)
CREATE TABLE IF NOT EXISTS variant_values (
    variant_id BIGINT NOT NULL,
    attribute_value_id BIGINT NOT NULL,
    PRIMARY KEY (variant_id, attribute_value_id),
    CONSTRAINT fk_var_val_var FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    CONSTRAINT fk_var_val_val FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- 5. Cập nhật bảng product_variants (Loại bỏ cột attributes cũ)
-- Chú ý: Cần đảm bảo không có ràng buộc nào đang dùng cột này
ALTER TABLE product_variants DROP COLUMN IF EXISTS attributes;

SET FOREIGN_KEY_CHECKS = 1;

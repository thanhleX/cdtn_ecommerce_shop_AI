-- ======================
-- CREATE DATABASE
-- ======================
CREATE DATABASE IF NOT EXISTS shop_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shop_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ======================
-- DROP TABLE
-- ======================
DROP TABLE IF EXISTS voucher_usages;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS variant_values;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS category_attributes;
DROP TABLE IF EXISTS attribute_values;
DROP TABLE IF EXISTS attributes;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS invalidated_tokens;

SET FOREIGN_KEY_CHECKS = 1;

-- ======================
-- TABLES
-- ======================
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE payment_methods (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  image TEXT,
  description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE vouchers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('PERCENT','FIXED') NOT NULL,
  value DOUBLE NOT NULL,
  min_order_value DOUBLE,
  max_discount DOUBLE,
  start_date DATETIME(6),
  end_date DATETIME(6),
  usage_limit INT,
  usage_per_user INT,
  status ENUM('ACTIVE','INACTIVE') NOT NULL,
  created_at DATETIME(6),
  updated_at DATETIME(6)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  provider VARCHAR(50) DEFAULT 'local',
  provider_id VARCHAR(255),
  created_at DATETIME(6),
  updated_at DATETIME(6)
) ENGINE=InnoDB;

CREATE TABLE roles_permissions_dummy (id INT); -- tránh lỗi thứ tự (xóa ngay dưới)
DROP TABLE roles_permissions_dummy;

CREATE TABLE blog_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(150),
  is_active BOOLEAN
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(150) UNIQUE,
  image_url TEXT,
  is_active BOOLEAN,
  parent_id BIGINT,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- ATTRIBUTES
CREATE TABLE attributes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_filterable BOOLEAN DEFAULT TRUE,
  is_pricing BOOLEAN DEFAULT FALSE,
  created_at DATETIME(6),
  updated_at DATETIME(6)
) ENGINE=InnoDB;

CREATE TABLE attribute_values (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attribute_id BIGINT NOT NULL,
  value VARCHAR(255),
  FOREIGN KEY (attribute_id) REFERENCES attributes(id)
) ENGINE=InnoDB;

CREATE TABLE category_attributes (
  category_id BIGINT,
  attribute_id BIGINT,
  PRIMARY KEY (category_id, attribute_id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (attribute_id) REFERENCES attributes(id)
) ENGINE=InnoDB;

-- USER RELATED
CREATE TABLE addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  full_address TEXT,
  receiver_name VARCHAR(100),
  phone VARCHAR(20),
  is_default BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE carts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(512) UNIQUE,
  expired_at DATETIME(6),
  created_at DATETIME(6),
  user_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  title VARCHAR(255),
  content TEXT,
  type ENUM('ORDER','SYSTEM'),
  is_read BOOLEAN,
  created_at DATETIME(6),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  user_id BIGINT,
  role_id BIGINT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  role_id BIGINT,
  permission_id BIGINT,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB;

-- PRODUCT
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  is_active BOOLEAN,
  average_rating DOUBLE DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  category_id BIGINT,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE product_variants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(12,2),
  quantity INT,
  is_active BOOLEAN,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE variant_values (
  variant_id BIGINT,
  attribute_value_id BIGINT,
  PRIMARY KEY (variant_id, attribute_value_id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id)
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  image_url TEXT,
  is_thumbnail BOOLEAN,
  sort_order INT,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE product_reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  status ENUM('ACTIVE','HIDDEN','REPORTED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(6),
  updated_at DATETIME(6),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB;

-- ORDER
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  address_id BIGINT,
  payment_method_id BIGINT,
  status ENUM('PENDING','CONFIRMED','SHIPPING','COMPLETED','CANCELLED'),
  total_amount DECIMAL(12,2),
  discount_amount DECIMAL(12,2),
  final_amount DECIMAL(12,2),
  shipping_fee DECIMAL(12,2),
  note TEXT,
  order_date DATETIME(6),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id),
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  product_variant_id BIGINT,
  product_name VARCHAR(255),
  quantity INT,
  price DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  variant_attributes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT,
  product_variant_id BIGINT,
  quantity INT,
  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
) ENGINE=InnoDB;

-- BLOG
CREATE TABLE blogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255),
  content TEXT,
  thumbnail TEXT,
  is_featured BOOLEAN,
  is_published BOOLEAN,
  carousel_order INT,
  blog_category_id BIGINT,
  user_id BIGINT,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  FOREIGN KEY (blog_category_id) REFERENCES blog_categories(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- VOUCHER USAGE
CREATE TABLE voucher_usages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  user_id BIGINT,
  voucher_id BIGINT,
  used_at DATETIME(6),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
) ENGINE=InnoDB;

-- ======================
-- INSERT DATA (IDEMPOTENT)
-- ======================

INSERT INTO roles (id, name)
VALUES (1,'SUPER_ADMIN'),(2,'CUSTOMER'),(3,'STAFF')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO permissions (id, name, description) VALUES
(1,'category:manage','Quản lý danh mục'),
(2,'voucher:manage','Quản lý voucher'),
(3,'blog:manage','Quản lý blog'),
(4,'role:read','Xem role'),
(5,'role:manage','Quản lý role'),
(6,'product:read','Đọc sản phẩm'),
(7,'product:create','Tạo sản phẩm'),
(8,'product:update','Cập nhật'),
(9,'product:delete','Xóa'),
(10,'order:read','Xem đơn'),
(11,'order:update','Cập nhật đơn'),
(12,'user:read','Xem user'),
(13,'user:manage','Quản lý user'),
(14,'customer:manage','QL khách'),
(15,'staff:manage','QL staff')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON DUPLICATE KEY UPDATE role_id=role_id;
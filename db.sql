-- ============================================================
-- DATABASE: shop_db
-- Đồng bộ hoàn toàn với Java Entity (Spring Boot / JPA)
-- Cập nhật: 2026-05-01
-- ============================================================
CREATE DATABASE IF NOT EXISTS shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shop_db;
SET FOREIGN_KEY_CHECKS = 0;
-- ============================================================
-- DROP TABLES (đúng thứ tự phụ thuộc)
-- ============================================================
DROP TABLE IF EXISTS otp_verifications;
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
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS payment_methods;
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- PHÂN QUYỀN (Roles / Permissions)
-- Entity: Role extends BaseEntity (chỉ có id)
-- Entity: Permission extends BaseEntity (chỉ có id)
-- ============================================================
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- role_permissions: join table của Role <-> Permission (ManyToMany, EAGER)
CREATE TABLE role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- USERS
-- Entity: User extends BaseAuditEntity (id, created_at, updated_at)
-- ============================================================
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'local',
  provider_id VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  INDEX idx_users_email (email),
  INDEX idx_users_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- user_roles: join table của User <-> Role (ManyToMany, EAGER)
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- OTP VERIFICATIONS
-- Entity: OtpVerification extends BaseEntity
-- Fields: id, email, otp_code, expired_at, is_used
-- ============================================================
CREATE TABLE otp_verifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expired_at DATETIME(6) NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX idx_otp_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- ADDRESSES
-- Entity: Address extends BaseEntity (chỉ có id, không có audit)
-- ============================================================
CREATE TABLE addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  full_address TEXT,
  receiver_name VARCHAR(100),
  phone VARCHAR(20),
  is_default BOOLEAN,
  CONSTRAINT fk_addr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_addr_user (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- NOTIFICATIONS
-- Entity: Notification extends BaseAuditEntity (id, created_at, updated_at)
-- Enum NotificationType: ORDER, SYSTEM
-- ============================================================
CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  title VARCHAR(255),
  content TEXT,
  type ENUM('ORDER', 'SYSTEM'),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_unread (user_id, is_read)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- PAYMENT METHODS
-- Entity: PaymentMethod extends BaseEntity (chỉ có id)
-- ============================================================
CREATE TABLE payment_methods (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  image TEXT,
  description VARCHAR(255)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- VOUCHERS
-- Entity: Voucher extends BaseAuditEntity (id, created_at, updated_at)
-- Enum VoucherType: PERCENT, FIXED
-- Enum VoucherStatus: ACTIVE, INACTIVE
-- ============================================================
CREATE TABLE vouchers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('PERCENT', 'FIXED') NOT NULL,
  value DOUBLE NOT NULL,
  min_order_value DOUBLE,
  max_discount DOUBLE,
  start_date DATETIME(6),
  end_date DATETIME(6),
  usage_limit INT,
  usage_per_user INT DEFAULT 1,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(6),
  updated_at DATETIME(6),
  INDEX idx_voucher_code (code),
  INDEX idx_voucher_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- BLOG CATEGORIES
-- Entity: BlogCategory extends BaseEntity (chỉ có id)
-- ============================================================
CREATE TABLE blog_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(150),
  is_active BOOLEAN DEFAULT TRUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- CATEGORIES (danh mục sản phẩm, tự tham chiếu)
-- Entity: Category extends BaseEntity (chỉ có id)
-- ============================================================
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(150) UNIQUE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  parent_id BIGINT,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE
  SET NULL,
    INDEX idx_cat_parent (parent_id),
    INDEX idx_cat_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- ATTRIBUTES (thuộc tính sản phẩm: Màu sắc, Kích thước...)
-- Entity: Attribute extends BaseAuditEntity (id, created_at, updated_at)
-- ============================================================
CREATE TABLE attributes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_filterable BOOLEAN DEFAULT TRUE,
  is_pricing BOOLEAN DEFAULT FALSE,
  created_at DATETIME(6),
  updated_at DATETIME(6)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- attribute_values: giá trị cụ thể của mỗi attribute (VD: Đỏ, Xanh, S, M, L)
-- Entity: AttributeValue extends BaseEntity
CREATE TABLE attribute_values (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attribute_id BIGINT NOT NULL,
  value VARCHAR(255) NOT NULL,
  CONSTRAINT fk_av_attr FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE,
  INDEX idx_av_attribute (attribute_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- category_attributes: join table Category <-> Attribute (ManyToMany)
CREATE TABLE category_attributes (
  category_id BIGINT NOT NULL,
  attribute_id BIGINT NOT NULL,
  PRIMARY KEY (category_id, attribute_id),
  CONSTRAINT fk_ca_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_ca_attribute FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- PRODUCTS
-- Entity: Product extends BaseAuditEntity (id, created_at, updated_at)
-- average_rating và review_count được update trực tiếp bởi ReviewService
-- ============================================================
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  average_rating DOUBLE DEFAULT 5.0,
  review_count INT DEFAULT 0,
  category_id BIGINT,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE
  SET NULL,
    INDEX idx_prod_category (category_id),
    INDEX idx_prod_slug (slug),
    INDEX idx_prod_active (is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- PRODUCT VARIANTS (biến thể sản phẩm: SKU, giá, tồn kho)
-- Entity: ProductVariant extends BaseEntity (chỉ có id)
-- ============================================================
CREATE TABLE product_variants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(12, 2),
  quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_pv_product (product_id),
  INDEX idx_pv_sku (sku)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- variant_values: join table ProductVariant <-> AttributeValue (ManyToMany)
CREATE TABLE variant_values (
  variant_id BIGINT NOT NULL,
  attribute_value_id BIGINT NOT NULL,
  PRIMARY KEY (variant_id, attribute_value_id),
  CONSTRAINT fk_vv_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CONSTRAINT fk_vv_avvalue FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- PRODUCT IMAGES
-- Entity: ProductImage extends BaseEntity (chỉ có id)
-- ============================================================
CREATE TABLE product_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT,
  image_url TEXT,
  is_thumbnail BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_pi_product (product_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- PRODUCT REVIEWS
-- Entity: ProductReview extends BaseAuditEntity (id, created_at, updated_at)
-- Enum ReviewStatus: ACTIVE, HIDDEN, REPORTED
-- Unique: (user_id, product_id) — mỗi user chỉ review 1 sản phẩm 1 lần
-- ============================================================
CREATE TABLE product_reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  status ENUM('ACTIVE', 'HIDDEN', 'REPORTED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(6),
  updated_at DATETIME(6),
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_product (user_id, product_id),
  INDEX idx_pr_product (product_id),
  INDEX idx_pr_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- CARTS
-- Entity: Cart extends BaseEntity (chỉ có id)
-- Quan hệ: OneToOne với User
-- ============================================================
CREATE TABLE carts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- cart_items: items trong giỏ hàng
-- Entity: CartItem extends BaseEntity (chỉ có id)
CREATE TABLE cart_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT,
  product_variant_id BIGINT,
  quantity INT DEFAULT 1,
  CONSTRAINT fk_ci_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  INDEX idx_ci_cart (cart_id),
  INDEX idx_ci_variant (product_variant_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- ORDERS
-- Entity: Order extends BaseEntity (chỉ có id, KHÔNG có audit)
-- Enum OrderStatus: PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED
-- ============================================================
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  address_id BIGINT,
  payment_method_id BIGINT,
  status ENUM(
    'PENDING',
    'CONFIRMED',
    'SHIPPING',
    'COMPLETED',
    'CANCELLED',
    'AWAIT_PAYMENT'
  ) NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(12, 2),
  discount_amount DECIMAL(12, 2),
  final_amount DECIMAL(12, 2),
  note TEXT,
  order_date DATETIME(6),
  CONSTRAINT fk_ord_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
  SET NULL,
    CONSTRAINT fk_ord_addr FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE
  SET NULL,
    CONSTRAINT fk_ord_payment FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE
  SET NULL,
    INDEX idx_ord_user (user_id),
    INDEX idx_ord_status (status),
    INDEX idx_ord_date (order_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- order_items: chi tiết từng sản phẩm trong đơn hàng (snapshot tại thời điểm đặt)
-- Entity: OrderItem extends BaseEntity (chỉ có id)
CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT,
  product_variant_id BIGINT,
  product_name VARCHAR(255),
  variant_attributes TEXT,
  price DECIMAL(12, 2),
  quantity INT,
  total_amount DECIMAL(12, 2),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE
  SET NULL,
    INDEX idx_oi_order (order_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- VOUCHER USAGES
-- Entity: VoucherUsage extends BaseEntity (chỉ có id)
-- Tất cả FK đều NOT NULL theo @JoinColumn(nullable = false)
-- ============================================================
CREATE TABLE voucher_usages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  voucher_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  order_id BIGINT NOT NULL,
  used_at DATETIME(6),
  CONSTRAINT fk_vu_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
  CONSTRAINT fk_vu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_vu_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_vu_voucher (voucher_id),
  INDEX idx_vu_user (user_id),
  INDEX idx_vu_order (order_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- BLOGS
-- Entity: Blog extends BaseAuditEntity (id, created_at, updated_at)
-- ============================================================
CREATE TABLE blogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255),
  content TEXT,
  thumbnail TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  carousel_order INT,
  blog_category_id BIGINT,
  user_id BIGINT,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  CONSTRAINT fk_blog_category FOREIGN KEY (blog_category_id) REFERENCES blog_categories(id) ON DELETE
  SET NULL,
    CONSTRAINT fk_blog_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
  SET NULL,
    INDEX idx_blog_category (blog_category_id),
    INDEX idx_blog_published (is_published),
    INDEX idx_blog_featured (is_featured)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- ============================================================
-- SEED DATA
-- ============================================================
-- Roles
INSERT INTO roles (id, name)
VALUES (1, 'ADMIN'),
  (2, 'CUSTOMER'),
  (3, 'STAFF') ON DUPLICATE KEY
UPDATE name =
VALUES(name);
-- Permissions
INSERT INTO permissions (id, name, description)
VALUES (1, 'category:manage', 'Quản lý danh mục'),
  (2, 'voucher:manage', 'Quản lý voucher'),
  (3, 'blog:manage', 'Quản lý blog'),
  (4, 'role:read', 'Xem role'),
  (5, 'role:manage', 'Quản lý role'),
  (6, 'product:read', 'Đọc sản phẩm'),
  (7, 'product:create', 'Tạo sản phẩm'),
  (8, 'product:update', 'Cập nhật sản phẩm'),
  (9, 'product:delete', 'Xóa sản phẩm'),
  (10, 'order:read', 'Xem đơn hàng'),
  (11, 'order:update', 'Cập nhật đơn hàng'),
  (12, 'user:read', 'Xem user'),
  (13, 'user:manage', 'Quản lý user'),
  (14, 'customer:manage', 'Quản lý khách hàng'),
  (15, 'staff:manage', 'Quản lý nhân viên'),
  (16, 'review:manage', 'Quản lý đánh giá') ON DUPLICATE KEY
UPDATE description =
VALUES(description);
-- ADMIN có tất cả permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1,
  id
FROM permissions ON DUPLICATE KEY
UPDATE role_id = role_id;
-- STAFF có quyền: xem & cập nhật orders, xem products, xem users
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3,
  id
FROM permissions
WHERE name IN (
    'order:read',
    'order:update',
    'product:read',
    'user:read',
    'review:manage'
  ) ON DUPLICATE KEY
UPDATE role_id = role_id;
-- Payment Methods
INSERT INTO payment_methods (id, name, description, image)
VALUES (
    1,
    'Thanh toán khi nhận hàng (COD)',
    'Trả tiền mặt khi nhận hàng tại nhà',
    'https://img.icons8.com/color/96/000000/delivery--v1.png'
  ),
  (
    2,
    'Thanh toán VNPay',
    'Thanh toán qua cổng VNPay (ATM / Thẻ quốc tế / QR)',
    'https://cdn.itviec.com/employers/vnpay/logo/social/8S9ZqD9zGzVzZzZzZzZzZzZz/vnpay-logo.png'
  ) ON DUPLICATE KEY
UPDATE name =
VALUES(name);
-- Blog Categories mặc định
INSERT INTO blog_categories (name, slug, is_active)
SELECT 'Tin tức', 'tin-tuc', true
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'tin-tuc');

INSERT INTO blog_categories (name, slug, is_active)
SELECT 'Khuyến mãi', 'khuyen-mai', true
WHERE NOT EXISTS (SELECT 1 FROM blog_categories WHERE slug = 'khuyen-mai');
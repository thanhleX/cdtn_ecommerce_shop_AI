package com.example.shop.domain.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // ================= AUTH (1000–1099) =================
    UNAUTHORIZED(1000, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS(1001, "Sai tên đăng nhập/mật khẩu", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1002, "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN(1003, "Refresh token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_BLACKLISTED(1004, "Token đã bị thu hồi, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    ACCOUNT_DISABLED(1005, "Tài khoản đã bị vô hiệu hóa", HttpStatus.FORBIDDEN),
    ACCOUNT_LINKING_REQUIRED(1006, "Email đã tồn tại, cần liên kết tài khoản", HttpStatus.ACCEPTED),
    INVALID_OTP(1007, "Mã OTP không chính xác", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1008, "Mã OTP đã hết hạn (60s)", HttpStatus.BAD_REQUEST),

    // ================= USER (1100–1199) =================
    USER_NOT_FOUND(1100, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    DUPLICATE_EMAIL(1101, "Email đã tồn tại", HttpStatus.CONFLICT),
    DUPLICATE_USERNAME(1102, "Tên đăng nhập đã tồn tại", HttpStatus.CONFLICT),
    INVALID_PASSWORD(1103, "Mật khẩu hiện tại không chính xác", HttpStatus.BAD_REQUEST),
    CONFIRM_PASSWORD_NOT_MATCH(1104, "Mật khẩu xác nhận không khớp", HttpStatus.BAD_REQUEST),
    ADDRESS_NOT_FOUND(1105, "Không tìm thấy địa chỉ", HttpStatus.NOT_FOUND),

    // ================= PRODUCT (1200–1299) =================
    PRODUCT_NOT_FOUND(1200, "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    PRODUCT_VARIANT_NOT_FOUND(1201, "Không tìm thấy phân loại sản phẩm", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(1202, "Tồn kho không đủ", HttpStatus.BAD_REQUEST),
    SKU_ALREADY_EXISTS(1203, "Mã SKU đã tồn tại", HttpStatus.CONFLICT),
    INVALID_IMAGE_URL(1204, "Đường dẫn ảnh không hợp lệ", HttpStatus.BAD_REQUEST),

    // ================= CART (1300–1399) =================
    CART_NOT_FOUND(1300, "Không tìm thấy giỏ hàng", HttpStatus.NOT_FOUND),
    CART_EMPTY(1301, "Giỏ hàng trống", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(1302, "Không tìm thấy sản phẩm trong giỏ", HttpStatus.NOT_FOUND),

    // ================= ORDER (1400–1499) =================
    ORDER_NOT_FOUND(1400, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    INVALID_ORDER_STATUS(1401, "Trạng thái đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    ORDER_NOT_COMPLETED(1402, "Chỉ được đánh giá khi đơn hàng đã hoàn thành", HttpStatus.BAD_REQUEST),
    PAYMENT_METHOD_NOT_FOUND(1403, "Không tìm thấy phương thức thanh toán", HttpStatus.NOT_FOUND),

    // ================= VOUCHER (1500–1599) =================
    VOUCHER_NOT_FOUND(1500, "Không tìm thấy mã giảm giá", HttpStatus.NOT_FOUND),
    VOUCHER_EXPIRED(1501, "Mã giảm giá đã hết hạn", HttpStatus.BAD_REQUEST),
    VOUCHER_NOT_STARTED(1502, "Mã giảm giá chưa đến ngày sử dụng", HttpStatus.BAD_REQUEST),
    VOUCHER_LIMIT_EXCEEDED(1503, "Mã giảm giá đã hết lượt sử dụng", HttpStatus.BAD_REQUEST),
    VOUCHER_USER_LIMIT_EXCEEDED(1504, "Bạn đã hết lượt sử dụng mã này", HttpStatus.BAD_REQUEST),
    VOUCHER_MIN_ORDER_VALUE(1505, "Đơn chưa đạt giá trị tối thiểu", HttpStatus.BAD_REQUEST),
    VOUCHER_INACTIVE(1506, "Mã giảm giá đang bị khóa", HttpStatus.BAD_REQUEST),
    DUPLICATE_CODE(1507, "Mã đã tồn tại", HttpStatus.CONFLICT),

    // ================= REVIEW (1600–1699) =================
    REVIEW_NOT_FOUND(1600, "Không tìm thấy đánh giá", HttpStatus.NOT_FOUND),
    ALREADY_REVIEWED(1601, "Sản phẩm đã được đánh giá", HttpStatus.BAD_REQUEST),
    USER_NOT_ELIGIBLE_TO_REVIEW(1602, "Chưa mua hoặc đã đánh giá", HttpStatus.FORBIDDEN),
    NOT_YOUR_REVIEW(1603, "Chỉ sửa được đánh giá của mình", HttpStatus.FORBIDDEN),
    REVIEW_EDIT_TIMEOUT(1604, "Quá thời gian chỉnh sửa (24h)", HttpStatus.BAD_REQUEST),

    // ================= CATEGORY (1700–1799) =================
    CATEGORY_NOT_FOUND(1700, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    INVALID_CATEGORY_PARENT(1701, "Danh mục cha không hợp lệ", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_CHILDREN(1702, "Không thể xóa danh mục có con", HttpStatus.BAD_REQUEST),

    // ================= BLOG (1800–1899) =================
    BLOG_NOT_FOUND(1800, "Không tìm thấy bài viết", HttpStatus.NOT_FOUND),
    BLOG_CATEGORY_NOT_FOUND(1801, "Không tìm thấy danh mục blog", HttpStatus.NOT_FOUND),

    // ================= NOTIFICATION (1900–1999) =================
    NOTIFICATION_NOT_FOUND(1900, "Không tìm thấy thông báo", HttpStatus.NOT_FOUND),

    // ================= ROLE (2000–2099) =================
    ROLE_ALREADY_EXISTS(2000, "Vai trò đã tồn tại", HttpStatus.CONFLICT),
    ROLE_IN_USE(2001, "Vai trò đang được sử dụng", HttpStatus.CONFLICT),
    CANNOT_DELETE_SYSTEM_ROLE(2002, "Không thể xóa vai trò hệ thống", HttpStatus.FORBIDDEN),
    CANNOT_MODIFY_ADMIN(2003, "Không thể sửa Quản trị viên hệ thống", HttpStatus.FORBIDDEN),

    // ================= COMMON =================
    FORBIDDEN(9000, "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống", HttpStatus.INTERNAL_SERVER_ERROR);

    private final int code;
    private final String message;
    private final HttpStatus statusCode;

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}

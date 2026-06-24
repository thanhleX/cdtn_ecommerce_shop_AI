package com.example.shop.application.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.scheduling.annotation.Async("taskExecutor")
    public void sendOtpEmail(String to, String otp) {
        String subject = "Mã xác thực đổi mật khẩu - VietTech Store";
        String content = "<h3>Xin chào,</h3>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại <b>VietTech Store</b>.</p>"
                + "<p>Mã OTP của bạn là: <b style='font-size: 24px; color: #1890ff;'>" + otp + "</b></p>"
                + "<p>Mã này có hiệu lực trong <b>60 giây</b>. Vui lòng không cung cấp mã này cho bất kỳ ai.</p>"
                + "<br/>"
                + "<p>Trân trọng,<br/>Đội ngũ VietTech Store</p>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
        }
    }

    @org.springframework.scheduling.annotation.Async("taskExecutor")
    public void sendOrderStatusEmail(String to, String customerName, Long orderId, String statusMessage) {
        String subject = "Cập nhật trạng thái đơn hàng #" + orderId + " - VietTech Store";
        String content = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 30px 10px;\">"
                + "<div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);\">"
                + "  <div style=\"background-color: #1890ff; padding: 25px; text-align: center; color: #ffffff;\">"
                + "    <h2 style=\"margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;\">VIETTECH STORE</h2>"
                + "  </div>"
                + "  <div style=\"padding: 30px;\">"
                + "    <h3 style=\"color: #333333; margin-top: 0; font-size: 18px;\">Xin chào " + customerName + ",</h3>"
                + "    <p style=\"color: #555555; line-height: 1.6; font-size: 15px;\">Chúng tôi xin thông báo đơn hàng <strong style=\"color: #1890ff;\">#" + orderId + "</strong> của bạn vừa được cập nhật trạng thái.</p>"
                + "    <div style=\"background-color: #f0f7ff; border-left: 4px solid #1890ff; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;\">"
                + "      <p style=\"margin: 0; color: #0050b3; font-size: 16px;\"><strong>Chi tiết cập nhật:</strong> " + statusMessage + "</p>"
                + "    </div>"
                + "    <p style=\"color: #555555; line-height: 1.6; font-size: 15px;\">Bạn có thể đăng nhập vào tài khoản trên website của chúng tôi để theo dõi chi tiết quá trình vận chuyển cũng như xem lại thông tin đơn hàng bất kỳ lúc nào.</p>"
                + "    <div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;\">"
                + "      <p style=\"color: #333333; margin: 0; font-weight: 500;\">Cảm ơn bạn đã tin tưởng và mua sắm tại VietTech Store!</p>"
                + "      <p style=\"color: #888888; margin: 5px 0 0 0; font-size: 14px;\">Trân trọng,<br/>Đội ngũ Chăm sóc Khách hàng</p>"
                + "    </div>"
                + "  </div>"
                + "  <div style=\"background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;\">"
                + "    <p style=\"margin: 0;\">© 2026 VietTech Store. All rights reserved.</p>"
                + "    <p style=\"margin: 5px 0 0 0;\">Email này được gửi tự động. Vui lòng không trả lời trực tiếp email này.</p>"
                + "  </div>"
                + "</div>"
                + "</div>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send order status email to {}: {}", to, e.getMessage());
        }
    }
}

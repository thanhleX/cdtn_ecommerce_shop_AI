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
}

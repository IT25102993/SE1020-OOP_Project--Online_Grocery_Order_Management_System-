package com.freshmart.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    
    private final ConcurrentHashMap<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String toEmail) {
        String code = generateCode();
        long expiryTime = System.currentTimeMillis() + (120 * 1000); // 2 minutes
        verificationCodes.put(toEmail, new VerificationData(code, expiryTime));

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "FreshMart Support");
            helper.setTo(toEmail);
            helper.setSubject("FreshMart - Your Verification Code");

            String htmlContent = "<html>" +
                    "<body style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;\">" +
                    "    <div style=\"max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;\">" +
                    "        <div style=\"background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 30px; text-align: center;\">" +
                    "            <h1 style=\"color: white; margin: 0; font-size: 28px; letter-spacing: 1px;\">FreshMart</h1>" +
                    "        </div>" +
                    "        <div style=\"padding: 40px; text-align: center;\">" +
                    "            <h2 style=\"color: #333; margin-bottom: 20px;\">Verification Code</h2>" +
                    "            <p style=\"color: #666; font-size: 16px; line-height: 1.6;\">Use the verification code below to verify your identity. This code is valid for <b>2 minutes</b>.</p>" +
                    "            <div style=\"margin: 40px 0;\">" +
                    "                <span style=\"background-color: #f9f9f9; border: 2px dashed #2ecc71; color: #2ecc71; font-size: 36px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;\">" + code + "</span>" +
                    "            </div>" +
                    "            <p style=\"color: #999; font-size: 14px;\">If you didn't request this code, please ignore this email.</p>" +
                    "        </div>" +
                    "        <div style=\"background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;\">" +
                    "            <p style=\"color: #888; font-size: 12px; margin: 0;\">&copy; 2026 FreshMart Grocery Store. All rights reserved.</p>" +
                    "        </div>" +
                    "    </div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true); // true indicates HTML

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Mailing failed: " + e.getMessage());
            throw new RuntimeException("Email failed to send. " + e.getMessage());
        }
    }

    public boolean verifyCode(String email, String code) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) return false;

        if (System.currentTimeMillis() > data.expiryTime) {
            verificationCodes.remove(email);
            return false;
        }

        if (data.code.equals(code)) {
            verificationCodes.remove(email);
            return true;
        }

        return false;
    }

    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private static class VerificationData {
        String code;
        long expiryTime;

        VerificationData(String code, long expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }
}
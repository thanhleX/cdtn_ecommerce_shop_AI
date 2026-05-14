package com.example.shop.application.service;

import com.example.shop.application.dto.response.NotificationResponse;
import com.example.shop.application.mapper.NotificationMapper;
import com.example.shop.domain.entity.Notification;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.enums.NotificationType;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.NotificationRepository;
import com.example.shop.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createNotification(Long userId, String title, String content, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);

        // Gửi realtime cá nhân
        NotificationResponse response = notificationMapper.toResponse(notification);
        sendRealTime(userId, response);
    }

    @Transactional
    public void createNotification(List<String> roles, String title, String content, NotificationType type) {
        List<User> users = userRepository.findByRoles_NameIn(roles);

        List<Notification> notifications = users.stream()
                .map(user -> Notification.builder()
                        .user(user)
                        .title(title)
                        .content(content)
                        .type(type)
                        .isRead(false)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);

        if (!notifications.isEmpty()) {
            NotificationResponse response = notificationMapper.toResponse(notifications.get(0));
            sendRealTime(roles, response);
        }
    }

    public void notifyManagement(String title, String content, NotificationType type) {
        List<String> managementRoles = List.of("ADMIN", "STAFF");
        createNotification(managementRoles, title, content, type);
    }

    public void sendRealTime(Long userId, NotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/notifications/user/" + userId, notification);
    }

    public void sendRealTime(List<String> roles, NotificationResponse notification) {
        for (String role : roles) {
            // Frontend expects ROLE_ prefix for authorities/roles
            String topicRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            messagingTemplate.convertAndSend("/topic/notifications/role/" + topicRole, notification);
        }
    }

    public Page<NotificationResponse> getNotifications(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    @Transactional
    public NotificationResponse markAsRead(String username, Long notificationId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        notification.setIsRead(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }
}

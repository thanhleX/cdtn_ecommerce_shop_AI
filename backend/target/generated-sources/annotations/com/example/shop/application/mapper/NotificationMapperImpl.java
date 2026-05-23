package com.example.shop.application.mapper;

import com.example.shop.application.dto.response.NotificationResponse;
import com.example.shop.domain.entity.Notification;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-15T08:52:59+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationResponse.NotificationResponseBuilder notificationResponse = NotificationResponse.builder();

        notificationResponse.content( notification.getContent() );
        notificationResponse.createdAt( notification.getCreatedAt() );
        notificationResponse.id( notification.getId() );
        notificationResponse.isRead( notification.getIsRead() );
        notificationResponse.title( notification.getTitle() );
        notificationResponse.type( notification.getType() );

        return notificationResponse.build();
    }
}

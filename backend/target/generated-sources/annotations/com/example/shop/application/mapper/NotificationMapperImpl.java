package com.example.shop.application.mapper;

import com.example.shop.application.dto.response.NotificationResponse;
import com.example.shop.domain.entity.Notification;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-30T14:13:09+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationResponse toResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationResponse.NotificationResponseBuilder notificationResponse = NotificationResponse.builder();

        notificationResponse.id( notification.getId() );
        notificationResponse.title( notification.getTitle() );
        notificationResponse.content( notification.getContent() );
        notificationResponse.type( notification.getType() );
        notificationResponse.isRead( notification.getIsRead() );
        notificationResponse.createdAt( notification.getCreatedAt() );

        return notificationResponse.build();
    }
}

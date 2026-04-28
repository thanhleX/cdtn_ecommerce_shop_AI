package com.example.shop.application.mapper;

import com.example.shop.application.dto.response.UserResponse;
import com.example.shop.domain.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-28T21:07:44+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toUserResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.createdAt( user.getCreatedAt() );
        userResponse.email( user.getEmail() );
        userResponse.fullName( user.getFullName() );
        userResponse.id( user.getId() );
        userResponse.isActive( user.getIsActive() );
        userResponse.updatedAt( user.getUpdatedAt() );
        userResponse.username( user.getUsername() );

        userResponse.roles( mapRoles(user.getRoles()) );
        userResponse.permissions( mapPermissions(user.getRoles()) );

        return userResponse.build();
    }
}

package com.scommit.domain.notification.notification.dto;

public record NotificationResponse(
        NotificationType type,
        String message,
        Long targetId
) {
}

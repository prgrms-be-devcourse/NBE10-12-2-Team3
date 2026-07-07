package com.scommit.domain.notification.notification.repository;

import com.scommit.domain.notification.notification.dto.NotificationResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitterRepository {

    private final ConcurrentHashMap<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public void add(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
    }

    public void sendToUser(Long userId, NotificationResponse response) {
        SseEmitter emitter = emitters.get(userId);

        if (emitter == null) {
            return;
        }

        try {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(response));
        } catch (IOException e) {
            emitters.remove(userId);
        }
    }

    public void remove(Long userId) {
        emitters.remove(userId);
    }
}

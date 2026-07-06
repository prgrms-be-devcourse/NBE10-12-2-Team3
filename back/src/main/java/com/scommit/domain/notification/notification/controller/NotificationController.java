package com.scommit.domain.notification.notification.controller;

import com.scommit.domain.notification.notification.repository.SseEmitterRepository;
import com.scommit.global.security.SecurityHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final SseEmitterRepository sseEmitterRepository;
    private final SecurityHelper securityHelper;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {

        Long userId = securityHelper.getActor().getId();

        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        sseEmitterRepository.add(userId, emitter);

        emitter.onTimeout(() -> sseEmitterRepository.remove(userId));
        emitter.onCompletion(() -> sseEmitterRepository.remove(userId));

        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected!"));
        } catch (IOException e) {
            sseEmitterRepository.remove(userId);
            throw new RuntimeException(e);
        }

        return emitter;
    }
}

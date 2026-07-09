package com.scommit.global.init;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.scommit.domain.post.comment.repository.CommentRepository;
import com.scommit.domain.post.post.repository.PostRepository;
import com.scommit.domain.series.series.repository.SeriesRepository;
import com.scommit.domain.subscription.subscription.repository.SubscriptionRepository;
import com.scommit.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Profile("prod")
@Component
@RequiredArgsConstructor
@Slf4j
public class ProdInitData implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final SeriesRepository seriesRepository;
    private final CommentRepository commentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final Cloudinary cloudinary;
    private final ProdInitDataService prodInitDataService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.count() > 0
                || postRepository.count() > 0
                || seriesRepository.count() > 0
                || commentRepository.count() > 0
                || subscriptionRepository.count() > 0) return;

        log.info("[ProdInitData] Cloudinary에 이미지 100장 업로드 시작...");
        List<String> thumbnailUrls = new ArrayList<>();
        List<String> bodyUrls = new ArrayList<>();

        for (int i = 0; i < 50; i++) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> thumbResult = cloudinary.uploader().upload(
                        "https://picsum.photos/seed/" + (i + 1) + "/1200/630",
                        ObjectUtils.asMap("folder", "posts", "resource_type", "image")
                );
                thumbnailUrls.add((String) thumbResult.get("secure_url"));
            } catch (Exception e) {
                log.warn("[ProdInitData] 썸네일 업로드 실패 (seed {}), 건너뜀", i + 1, e);
                thumbnailUrls.add(null);
            }
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> bodyResult = cloudinary.uploader().upload(
                        "https://picsum.photos/seed/" + (i + 51) + "/800/600",
                        ObjectUtils.asMap("folder", "posts", "resource_type", "image")
                );
                bodyUrls.add((String) bodyResult.get("secure_url"));
            } catch (Exception e) {
                log.warn("[ProdInitData] 본문 이미지 업로드 실패 (seed {}), 건너뜀", i + 51, e);
                bodyUrls.add(null);
            }
        }

        log.info("[ProdInitData] Cloudinary 업로드 완료. DB 데이터 삽입 시작...");
        prodInitDataService.insertAll(thumbnailUrls, bodyUrls);
        log.info("[ProdInitData] 초기 데이터 삽입 완료.");
    }
}
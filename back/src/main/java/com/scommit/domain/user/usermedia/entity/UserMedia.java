package com.scommit.domain.user.usermedia.entity;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_media")
public class UserMedia extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private Media media;

    @Builder
    public UserMedia(User user, Media media) {
        this.user = user;
        this.media = media;
    }

    public void updateMedia(Media media) {
        this.media = media;
    }
}
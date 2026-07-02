package com.scommit.domain.post.postmedia.entity;

import com.scommit.domain.media.media.entity.Media;
import com.scommit.domain.post.post.entity.Post;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "post_media")
public class PostMedia extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private Media media;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PostMediaType type;

    @Builder
    public PostMedia(Post post, Media media, PostMediaType type) {
        this.post = post;
        this.media = media;
        this.type = type;
    }

    public void updateMedia(Media media) {
        this.media = media;
    }
}

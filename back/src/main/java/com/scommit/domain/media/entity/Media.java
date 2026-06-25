package com.scommit.domain.media.entity;

import com.scommit.domain.post.entity.Post;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "media")
public class Media extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType type;

    public enum MediaType{
        IMAGE, VIDEO
    }

    @Builder
    public Media(Post post, String url, MediaType type) {
        this.post = post;
        this.url = url;
        this.type = type;
    }
}
   
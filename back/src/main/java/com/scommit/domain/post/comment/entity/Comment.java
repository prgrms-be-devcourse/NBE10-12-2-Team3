package com.scommit.domain.post.comment.entity;

import com.scommit.domain.post.post.entity.Post;
import com.scommit.domain.user.user.entity.User;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "comments")
@EntityListeners(AuditingEntityListener.class)
public class Comment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true) // TODO: 유저 연동 완료 후 nullable = false로 복구
    private User user;

    @Column(columnDefinition = "TEXT")
    private String body;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Comment(Post post, User user, String body) {
        this.post = post;
        this.user = user;
        this.body = body;
    }

    public void update(String body) {
        this.body = body;
    }
}

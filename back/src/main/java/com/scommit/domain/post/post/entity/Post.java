package com.scommit.domain.post.post.entity;

import com.scommit.domain.post.postmedia.entity.PostMedia;
import com.scommit.domain.series.series.entity.Series;
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
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "posts")
@EntityListeners(AuditingEntityListener.class)
public class Post extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true) // TODO: Security 완료 후 nullable = false로 복구
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id")
    private Series series ;

    @Column(nullable = false)
    private String title;
 
    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "publish_status", nullable = false)
    private PublishStatus publishStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false)
    private PostAccessLevel accessLevel;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY)
    private List<PostMedia> medias = new ArrayList<>();
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Post(User user, Series series, String title, String body, PublishStatus publishStatus, PostAccessLevel accessLevel) {
      this.user = user; 
      this.series = series ;
      this.title = title;
      this.body = body;
      this.publishStatus = publishStatus;
      this.accessLevel = accessLevel;
      this.viewCount = 0L;
    }

    public void update(String title, String body, PublishStatus publishStatus, PostAccessLevel accessLevel, Series series) {
        this.title = title;
        this.body = body;
        this.publishStatus = publishStatus;
        this.accessLevel = accessLevel;
        this.series = series;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }
}

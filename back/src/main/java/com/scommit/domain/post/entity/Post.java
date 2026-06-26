package com.scommit.domain.post.entity;

import com.scommit.domain.series.entity.Series;
import com.scommit.domain.user.entity.User;
import com.scommit.global.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "posts")
public class Post extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id")
    private Series series ;

    @Column(nullable = false)
    private String title;
 
    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Enumerated(EnumType.STRING)
    @Column(name = "publish_status", nullable = false)
    private PublishStatus publishStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false)
    private PostAccessLevel accessLevel;

    @Column(name = "view_count", nullable = false)   
    private Long viewCount = 0L;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum PublishStatus{
        DRAFT, PRIVATE, PUBLIC
    }

    public enum PostAccessLevel{
        FREE, PAID
    }

    @Builder
    public Post(User user, Series series, String title, String body, String thumbnail, PublishStatus publishStatus, PostAccessLevel accessLevel){
      this.user = user; 
      this.series = series ;
      this.title = title;
      this.body = body;
      this.thumbnail = thumbnail;
      this.publishStatus = publishStatus;
      this.accessLevel = accessLevel;
      this.viewCount = 0L;
    }
}
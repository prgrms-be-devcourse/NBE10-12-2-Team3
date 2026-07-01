package com.scommit.domain.user.user.entity;

import com.scommit.global.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "users")
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;

    @Column(unique = true, nullable = false)
    private String nickname;

    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage;

    private String introduction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "refresh_token", unique = true) 
    private String refreshToken;
     
    @Builder 
    public User(String email, String password, String nickname, String profileImage, String introduction, UserRole role) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.introduction = introduction;
        this.role = role;
    }

    public User(Long id, String email, String nickname) {
        setId(id);
        this.email = email;
        this.nickname = nickname;
    }

    public User(Long id, String email, String nickname, UserRole role) {
        this(id, email, nickname);
        this.role = role;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return getAuthoritiesAsStringList()
                .stream()
                .map(SimpleGrantedAuthority::new)
                .toList();
    }

    private List<String> getAuthoritiesAsStringList() {
        List<String> authorities = new ArrayList<>();

        if (role.equals(UserRole.ADMIN)) {
            authorities.add("ROLE_ADMIN");
        }

        return authorities;
    }

    public void resetRefreshToken() {
        this.refreshToken = UUID.randomUUID().toString();
    }
}

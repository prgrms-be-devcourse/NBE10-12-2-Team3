package com.scommit.global.security;

import com.scommit.domain.user.user.entity.UserRole;
import com.scommit.global.dto.RsData;
import com.scommit.global.security.jwt.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtFilter JwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                )
                .exceptionHandling(
                        exceptionHandling -> exceptionHandling
                                .authenticationEntryPoint(
                                        (request, response, authException) -> {
                                            response.setContentType("application/json;charset=UTF-8");

                                            response.setStatus(401);
                                            response.getWriter().write(
                                                    JsonUtility.toString(
                                                            new RsData<Void>(
                                                                    "401-1",
                                                                    "로그인 후 이용해주세요."
                                                            )
                                                    )
                                            );
                                        }
                                )
                                .accessDeniedHandler(
                                        (request, response, accessDeniedException) -> {
                                            response.setContentType("application/json;charset=UTF-8");

                                            response.setStatus(403);
                                            response.getWriter().write(
                                                   JsonUtility.toString(
                                                            new RsData<Void>(
                                                                    "403-1",
                                                                    "권한이 없습니다."
                                                            )
                                                    )
                                            );
                                        }
                                )
                )
                .addFilterBefore(JwtFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // 정적 리소스
                        .requestMatchers(
                                "/favicon.ico",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/static/**"
                        ).permitAll()
                        // 문서
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**"
                        ).permitAll()
                        //인증 이전에 호출되는 API
                        .requestMatchers(
                                "/api/users/signup",
                                "/api/users/login"
                        ).permitAll()
                        //공개 조회 API — 비로그인 사용자도 볼 수 있는 GET 요청들
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/{id:\\d+}",
                                "/api/series",
                                "/api/series/{id:\\d+}",
                                "/api/posts",
                                "/api/posts/{id:\\d+}",
                                "/api/posts/{id:\\d+}/comments"
                        ).permitAll()
                        // 일반 인증 필요 경로
                        .requestMatchers("/api/**").authenticated()
                        // api가 아닌 명시되지 않은 경로는 인증 요구
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}

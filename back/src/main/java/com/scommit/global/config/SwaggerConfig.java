package com.scommit.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SCommit API")
                        .description("개발자 블로그 플랫폼 SCommit API 명세서")
                        .version("v1.0.0"))
                .tags(List.of(
                        new Tag().name("Post").description("게시글 관련 API")
                ));
    }
}
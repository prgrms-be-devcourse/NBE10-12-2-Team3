package com.scommit.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SwaggerConfig {

    // Swagger UI 우상단 Authorize 버튼 활성화 — Bearer JWT 토큰 입력 후 인증 필요 API 테스트 가능
    @Bean
    public OpenAPI openAPI() {
        SecurityScheme bearerAuth = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        SecurityRequirement securityRequirement = new SecurityRequirement().addList("bearerAuth");

        return new OpenAPI()
                .info(new Info()
                        .title("SCommit API")
                        .description("개발자 블로그 플랫폼 SCommit API 명세서")
                        .version("v1.0.0"))
                .components(new Components().addSecuritySchemes("bearerAuth", bearerAuth))
                .addSecurityItem(securityRequirement);
    }

    // Swagger에서 Pageable이 JSON 객체로 표시되는 문제를 막기 위해 page, size, sort 파라미터로 직접 등록
    @Bean
    public OpenApiCustomizer swaggerPageableCustomizer() {
        return openApi -> openApi.getPaths().values().forEach(pathItem ->
                pathItem.readOperations().forEach(operation -> {
                    if (operation.getParameters() == null) return;

                    boolean hasPageable = operation.getParameters().stream()
                            .anyMatch(p -> "pageable".equals(p.getName()));

                    operation.getParameters().removeIf(param ->
                            "pageable".equals(param.getName()) || "sort".equals(param.getName()));

                    if (hasPageable) {
                        List<Parameter> pageParams = new ArrayList<>();
                        pageParams.add(new Parameter()
                                .in("query").name("page")
                                .description("페이지 번호 (0부터 시작)")
                                .schema(new IntegerSchema().example(0)));
                        pageParams.add(new Parameter()
                                .in("query").name("size")
                                .description("페이지 크기")
                                .schema(new IntegerSchema().example(10)));
                        pageParams.add(new Parameter()
                                .in("query").name("sort")
                                .description("정렬 (예: id,desc)")
                                .schema(new StringSchema().example("id,desc")));
                        operation.getParameters().addAll(pageParams);
                    }
                })
        );
    }
}

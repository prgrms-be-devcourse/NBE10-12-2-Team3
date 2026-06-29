package com.scommit.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Paths;

@Configuration
public class MediaConfig implements WebMvcConfigurer {

    @Value("${file.path}")
    private String mediaPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String locationUri = Paths.get(mediaPath).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/media/**")
                .addResourceLocations(locationUri);
    }
}

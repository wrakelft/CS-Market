package ru.itmo.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowOrigins;

    @Value("${app.cors.allow-credentials:false}")
    private boolean allowCredentials;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = Arrays.stream(allowOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toArray(String[]::new);

        var reg = registry.addMapping("/**")
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Location")
                .allowCredentials(allowCredentials)
                .maxAge(3600);

        boolean hashWildcard = Arrays.stream(origins).anyMatch("*"::equals);
        if (hashWildcard) {
            if (allowCredentials) {
                throw new IllegalArgumentException("CORS: allow-credentials=true cannot be used with allowed-origins='*'.");
            }
            reg.allowedOriginPatterns("*");
        } else {
            reg.allowedOrigins(origins);
        }
    }
}

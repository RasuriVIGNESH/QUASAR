package com.ADP.peerConnect.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class ProjectDeletedWebConfig implements WebMvcConfigurer {
    private final ProjectDeletedInterceptor projectDeletedInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(projectDeletedInterceptor).addPathPatterns("/**");
    }
}

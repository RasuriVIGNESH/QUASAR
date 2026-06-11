package com.ADP.peerConnect.config;

import com.ADP.peerConnect.security.JwtAuthenticationEntryPoint;
import com.ADP.peerConnect.security.JwtAuthenticationFilter;
import com.ADP.peerConnect.security.oauth2.CustomOAuth2UserService;
import com.ADP.peerConnect.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.ADP.peerConnect.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.ADP.peerConnect.service.Impl.UserService;
import com.ADP.peerConnect.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Autowired
    private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        String[] publicStaticEndpoints = {
                "/favicon.ico",
                "/.well-known/**",
                "/api/colleges",
                "/api/colleges/**",
                "/api/count",
                "/api/health",
                "/api/branches",
                "/api/branches/**",
                "/api/RecentProjects",
                "/api/popularSkills",
                "/api/graduation-years",
                "/api/predefined-skills/**",
                "/public/**"
        };

        http
                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable())

                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(unauthorizedHandler)
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/oauth2/**",
                                "/login/**",
                                "/error"
                        ).permitAll()

                        .requestMatchers(
                                Constants.AUTH_BASE_PATH + "/**"
                        ).permitAll()

                        .requestMatchers(publicStaticEndpoints)
                        .permitAll()

                        // Swagger
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/api-docs/**",
                                "/images/**"
                        ).permitAll()

                        // Admin
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Mentor
                        .requestMatchers("/api/mentor/**")
                        .hasAnyRole("MENTOR", "ADMIN")

                        // Student
                        .requestMatchers("/api/student/**")
                        .hasRole("STUDENT")

                        // All other requests
                        .anyRequest()
                        .authenticated()
                )

                .oauth2Login(oauth2 -> oauth2

                        .authorizationEndpoint(auth ->
                                auth.baseUri("/oauth2/authorization")
                        )

                        .redirectionEndpoint(redir ->
                                redir.baseUri("/login/oauth2/code/*")
                        )

                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(customOAuth2UserService)
                        )

                        .successHandler(
                                oAuth2AuthenticationSuccessHandler
                        )

                        .failureHandler(
                                oAuth2AuthenticationFailureHandler
                        )
                );

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(
                jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}
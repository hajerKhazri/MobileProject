package enda_tao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.List;
@Configuration
public class SecurityConfig {



    @Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {

    JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();

    converter.setAuthorityPrefix("");
    converter.setAuthoritiesClaimName("realm_access.roles");

    JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
    jwtConverter.setJwtGrantedAuthoritiesConverter(converter);

    return jwtConverter;
}

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtCookieFilter jwtCookieFilter) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 🔥 COOKIE AUTH FILTER
            .addFilterBefore(jwtCookieFilter, UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // PUBLIC ENDPOINTS
                        .requestMatchers(
                                "/auth/login",
                                "/auth/logout",
                                "/auth/refresh",
                                "/oauth2/**",
                                "/auth/users",
                                "/dashboard/regions",
                                "/dashboard/superviseurs",  // ✅ AJOUTE CETTE LIGNE
                                "/api/events/**"// ✅ C'est cette ligne qui va tout débloquer !
                        ).permitAll()

                // Swagger
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/swagger-ui.html",
                    "/webjars/**",
                        "/api/events/**",
                    "/"
                ).permitAll()

                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://localhost:19006", // ⚠️ C'est le port d'Expo (React Native)
                "http://localhost:19000"  // ⚠️ Un autre port d'Expo
        ));

        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
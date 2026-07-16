package com.travel.planner;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 비밀번호를 암호화해주는 인코더 빈(Bean) 등록
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

 // 시큐리티 기본 로그인창을 해제하고 모든 접근을 허용하는 설정 (스프링 부트 3.x 최신 표준 문법)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 보안 잠금 해제 (로컬 테스트용)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // 모든 URL(index.html 등)에 자유롭게 접근 허용
            );
        
        return http.build();
    }
}
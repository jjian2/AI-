package com.travel.planner;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // 아이디로 유저 정보 조회
    Optional<User> findByUsername(String username);
    
    // 🌟 이 줄을 꼭 추가해 주세요! (JPA가 자동으로 아이디 존재 여부를 확인해 주는 규칙입니다)
    boolean existsByUsername(String username);
}
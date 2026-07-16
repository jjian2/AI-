package com.travel.planner;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 암호화 컴포넌트 추가
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // SecurityConfig에서 등록한 암호화 빈 주입

    /**
     * 회원가입 로직 (비밀번호 암호화 적용)
     * @param user 사용자가 입력한 가입 정보
     * @return 저장된 유저 객체
     */
    public User register(User user) {
        // 🌟 유저가 입력한 날것의 비밀번호를 가져와 암호화(해싱)합니다.
        String rawPassword = user.getPassword();
        String encryptedPassword = passwordEncoder.encode(rawPassword);
        
        // 암호화된 비밀번호로 다시 세팅합니다.
        user.setPassword(encryptedPassword);
        
        return userRepository.save(user); // DB에 회원 정보 저장
    }

    /**
     * 아이디 중복 여부 확인
     * @param username 확인할 아이디
     * @return 존재하면 true, 없으면 false
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * 아이디로 유저 단건 조회 (로그인 시 미가입 유저 체크용)
     * @param username 조회할 아이디
     * @return 조회된 User 객체 (없으면 null)
     */
    public User findByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.orElse(null); // 값이 있으면 유저 반환, 없으면 null 반환
    }

    /**
     * (선택) 기존 로그인 검증 로직 - 현재 컨트롤러에서 직접 처리하므로 지우거나 유지해도 무방합니다.
     */
    public User login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // 암호화 매칭 방식으로 비교 체인지
            if (passwordEncoder.matches(password, user.getPassword())) { 
                return user;
            }
        }
        return null;
    }
}

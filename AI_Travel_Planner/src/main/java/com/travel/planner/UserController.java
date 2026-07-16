package com.travel.planner;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 암호화 매칭용 추가
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping; // 추가
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody; // 추가
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // SecurityConfig에서 만든 암호화 빈 주입

    // 🌟 [기능 1] 아이디 중복확인 API (main.js가 버튼 누를 때 호출함)
    @GetMapping("/api/user/check-id")
    @ResponseBody
    public boolean checkIdDuplicate(@RequestParam("username") String username) {
        // DB에 아이디가 존재하면 true(중복됨), 없으면 false(사용가능) 반환
        return userService.existsByUsername(username);
    }

    /* @PostMapping("/login")
    public String handleLogin(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        // 1. 먼저 가입된 유저가 맞는지 아이디로 조회합니다.
        User user = userService.findByUsername(username);
        
        // 🌟 [수정 1] 아이디가 없는 유저도 똑같이 loginfail 경로로 보냅니다!
        if (user == null) {
            return "redirect:/index.html?error=loginfail";
        }
        
        // [보안] 아이디가 있다면, 암호화된 비밀번호가 일치하는지 검증합니다.
        if (passwordEncoder.matches(password, user.getPassword())) {
            // 로그인 성공 시 세션에 유저 정보 보관
            session.setAttribute("loginUser", user);
            return "redirect:/main.html"; 
        } else {
            // 🌟 [수정 2] 비밀번호가 틀린 유저도 똑같이 loginfail 경로로 통일합니다!
            return "redirect:/index.html?error=loginfail";
        }
    } */
    
    @PostMapping("/login")
    public String handleLogin(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        // 1. 기존 로그인 실패 횟수를 가져옴 (없으면 0)
        Integer failCount = (Integer) session.getAttribute("loginFailCount");
        if (failCount == null) failCount = 0;

        // 2. 가입된 유저인지 조회
        User user = userService.findByUsername(username);
        
        // 3. 로그인 성공 시
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            session.removeAttribute("loginFailCount"); // 성공 시 횟수 초기화
            session.setAttribute("loginUser", user);
            return "redirect:/main.html"; 
        } 

        // 4. 로그인 실패 시 횟수 증가
        failCount++;
        session.setAttribute("loginFailCount", failCount);

        // 5. 3회 이상 실패 시 회원가입 모달로 강제 이동
        if (failCount >= 3) {
            session.removeAttribute("loginFailCount"); // 횟수 초기화
            return "redirect:/index.html?error=notfound"; // 기존의 회원가입 모달 유도 파라미터 사용
        }

        // 6. 3회 미만일 때는 기존처럼 로그인 화면에 머물며 에러 메시지 표시
        return "redirect:/index.html?error=loginfail";
    }
    
    @PostMapping("/signup")
    public String handleSignup(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            RedirectAttributes redirectAttributes) {
        
        // 1. 전달받은 가입 정보로 User 객체 생성
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password); // 💡 서비스(UserService) 내부에서 암호화되므로 그대로 전달
        newUser.setName(name);
        newUser.setEmail(email);
        
        // 2. 서비스 호출하여 DB에 저장
        User savedUser = userService.register(newUser);
        
        if (savedUser != null) {
            // 가입 성공 메시지와 함께 로그인 페이지로 이동
            redirectAttributes.addFlashAttribute("message", "회원가입이 완료되었습니다! 로그인을 진행해 주세요.");
            return "redirect:/index.html";
        } else {
            redirectAttributes.addFlashAttribute("error", "회원가입에 실패했습니다. 다시 시도해 주세요.");
            return "redirect:/index.html";
        }
    }
}
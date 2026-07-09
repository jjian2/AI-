/* ==========================================================================
   로그인 처리 로직
   ========================================================================== */
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("userId").value.trim();
    const pw = document.getElementById("userPw").value.trim();

    if (!id || !pw) {
        alert("ID와 Password를 모두 입력해주세요.");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: id, password: pw })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            alert(errorData?.message || "로그인에 실패했습니다. ID/PW를 확인해주세요.");
            return;
        }

        const data = await response.json();
        console.log("로그인 성공:", data);

        // 서버에서 토큰을 내려주는 경우 처리
        if (data.token) {
            sessionStorage.setItem("accessToken", data.token);
        }

        window.location.href = "main.html";
    } catch (error) {
        console.error("서버 연결 오류:", error);
        alert("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    }
});

/* ==========================================================================
   회원가입 모달 제어
   ========================================================================== */
const signupModal = document.getElementById("signupModal");
const openSignupBtn = document.getElementById("openSignup");
const closeSignupBtn = document.getElementById("closeSignup");
const backToLoginBtn = document.getElementById("backToLogin");

const openModal = () => signupModal.classList.add("open");
const closeModal = () => {
    signupModal.classList.remove("open");
    resetSignupForm();
};

openSignupBtn.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
closeSignupBtn.addEventListener("click", closeModal);
backToLoginBtn.addEventListener("click", (e) => { e.preventDefault(); closeModal(); });

// 모달 외부 영역 클릭 시 닫기
signupModal.addEventListener("click", (e) => {
    if (e.target === signupModal) closeModal();
});

// ESC 키로 모달 닫기
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && signupModal.classList.contains("open")) closeModal();
});

/* ==========================================================================
   회원가입 폼 로직
   ========================================================================== */
const signupForm = document.getElementById("signupForm");
let idCheckPassed = false;

signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const id = document.getElementById("signupId").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const pw = document.getElementById("signupPw").value.trim();
    const pwConfirm = document.getElementById("signupPwConfirm").value.trim();

    if (!name || !id || !email || !pw || !pwConfirm) {
        alert("모든 항목을 입력해주세요.");
        return;
    }
    if (!checkPasswordMatch()) return alert("비밀번호가 일치하지 않습니다.");
    if (!idCheckPassed) return alert("아이디 중복확인을 완료해주세요.");

    // TODO: 실제 회원가입 API 연동 (백엔드 완성 후 fetch로 교체)
    console.log("회원가입 시도:", { name, id, email, pw });
    saveIdAsRegistered(id);
    alert(`${name}님, 회원가입 요청을 보냈습니다.`);

    resetSignupForm();
    closeModal();
});

function resetSignupForm() {
    signupForm.reset();
    checkIdBtn.textContent = "중복확인";
    checkIdBtn.className = "check-btn";
    idCheckMsg.textContent = "";
    idCheckPassed = false;
    pwMismatchMsg.textContent = "";
}

/* ==========================================================================
   아이디 중복확인 (임시: localStorage 활용)
   ========================================================================== */
const checkIdBtn = document.getElementById("checkIdBtn");
const signupIdInput = document.getElementById("signupId");
const idCheckMsg = document.getElementById("idCheckMsg");

checkIdBtn.addEventListener("click", function () {
    const id = signupIdInput.value.trim();
    if (!id) {
        idCheckMsg.textContent = "아이디를 먼저 입력해주세요.";
        idCheckMsg.className = "field-msg error";
        return;
    }

    const taken = JSON.parse(localStorage.getItem("registeredIds") || "[]").includes(id);

    if (taken) {
        checkIdBtn.textContent = "중복있음";
        checkIdBtn.className = "check-btn duplicate";
        idCheckMsg.textContent = "이미 사용 중인 아이디입니다.";
        idCheckMsg.className = "field-msg error";
        idCheckPassed = false;
    } else {
        checkIdBtn.textContent = "중복 없음";
        checkIdBtn.className = "check-btn available";
        idCheckMsg.textContent = "사용 가능한 아이디입니다.";
        idCheckMsg.className = "field-msg success";
        idCheckPassed = true;
    }
});

signupIdInput.addEventListener("input", () => {
    checkIdBtn.textContent = "중복확인";
    checkIdBtn.className = "check-btn";
    idCheckMsg.textContent = "";
    idCheckPassed = false;
});

function saveIdAsRegistered(id) {
    const takenIds = JSON.parse(localStorage.getItem("registeredIds") || "[]");
    takenIds.push(id);
    localStorage.setItem("registeredIds", JSON.stringify(takenIds));
}

/* ==========================================================================
   비밀번호 일치 여부 실시간 체크
   ========================================================================== */
const signupPwInput = document.getElementById("signupPw");
const signupPwConfirmInput = document.getElementById("signupPwConfirm");
const pwMismatchMsg = document.getElementById("pwMismatchMsg");

function checkPasswordMatch() {
    const pw = signupPwInput.value;
    const pwConfirm = signupPwConfirmInput.value;
    const isMatch = pw === pwConfirm;

    if (pwConfirm && !isMatch) {
        pwMismatchMsg.textContent = "비밀번호가 다릅니다.";
        return false;
    } else {
        pwMismatchMsg.textContent = "";
        return true;
    }
}

signupPwInput.addEventListener("input", checkPasswordMatch);
signupPwConfirmInput.addEventListener("input", checkPasswordMatch);
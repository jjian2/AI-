// --- 1. 프로필 사진 변경 관련 로직 ---
const avatarContainer = document.getElementById('avatarContainer');
const avatarInput = document.getElementById('avatarInput');
const profileImg = document.getElementById('profileImg');

avatarContainer.addEventListener('click', () => {
    avatarInput.click();
});

avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 선택 가능합니다.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            profileImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// --- 2. 프로필 정보 저장 (필수값 체크 및 색상 피드백) ---
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const msg = document.getElementById('profileSaveMsg');

    // 필수 입력값 검증
    if (!name || !email) {
        msg.textContent = '이름과 이메일을 모두 입력해주세요.';
        msg.style.color = '#dc2626'; // 빨간색 (에러)
        return;
    }

    // 서버 전송 로직 (FormData)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if(avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
    }

    // 성공 처리
    msg.textContent = '프로필 사진과 정보가 성공적으로 저장되었습니다.';
    msg.style.color = '#1b3f9e'; // 파란색 (성공)
    setTimeout(() => msg.textContent = '', 3000);
});

// --- 3. 비밀번호 변경 (필수값 체크 및 색상 피드백) ---
const pwForm = document.getElementById('passwordForm');
pwForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentPw = document.getElementById('currentPw').value;
    const newPw = document.getElementById('newPw').value;
    const confirmPw = document.getElementById('newPwConfirm').value;
    const errorMsg = document.getElementById('newPwMismatchMsg');
    const successMsg = document.getElementById('passwordSaveMsg');

    // 초기화
    errorMsg.textContent = '';
    successMsg.textContent = '';

    // 필수 입력값 검증
    if (!currentPw || !newPw || !confirmPw) {
        errorMsg.textContent = '모든 비밀번호 칸을 입력해주세요.';
        errorMsg.style.color = '#dc2626'; // 빨간색
        return;
    }

    // 새 비밀번호 일치 확인
    if (newPw !== confirmPw) {
        errorMsg.textContent = '새 비밀번호가 일치하지 않습니다.';
        errorMsg.style.color = '#dc2626'; // 빨간색
        return;
    }
    
    // 성공 처리
    successMsg.textContent = '비밀번호가 변경되었습니다.';
    successMsg.style.color = '#1b3f9e'; // 파란색
    setTimeout(() => successMsg.textContent = '', 3000);
});

// --- 4. 회원 탈퇴 ---
document.getElementById('withdrawBtn').addEventListener('click', () => {
    if (confirm('정말 탈퇴하시겠습니까? 데이터는 복구할 수 없습니다.')) {
        alert('탈퇴 처리되었습니다.');
        window.location.href = 'index.html';
    }
});
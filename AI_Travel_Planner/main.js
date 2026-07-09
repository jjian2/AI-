/* ===== 사이드바 네비게이션 (지금은 화면 전환 없이 활성 표시만) ===== */
/* nav-group-toggle("여행 일정")은 펼침/접힘 전용이라 아래 활성화 로직에서 제외 */
const navItems = document.querySelectorAll(".nav-item:not(.nav-group-toggle)");

navItems.forEach((item) => {
  item.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // 아직 안 만든 페이지("#")는 이동 막고 활성 표시만, 실제 페이지는 정상 이동
    if (!href || href === "#") {
      e.preventDefault();
      navItems.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
      deactivateAllTrips();
      console.log("아직 준비되지 않은 메뉴입니다:", this.dataset.target);
    }
    // href가 실제 페이지면 preventDefault 안 하고 그대로 이동시킴
  });
});

/* "여행 일정" 클릭 → 서브메뉴 펼침/접힘 */
const scheduleToggle = document.getElementById("scheduleToggle");
const navGroup = scheduleToggle.closest(".nav-group");

scheduleToggle.addEventListener("click", function () {
  navGroup.classList.toggle("open");
});

/* ===== 여행 목록(서브메뉴) 관리 ===== */
const tripList = document.getElementById("tripList");
const tripEmptyMsg = document.getElementById("tripEmptyMsg");
const tripAddItem = document.getElementById("tripAddItem");
const homeNavItem = document.querySelector('.nav-item[data-target="home"]');

const TRIPS_STORAGE_KEY = "ai_travel_planner_trips";   // TODO: 백엔드 연동 시 localStorage 대신 서버 API로 교체

let trips = [];
let tripIdCounter = 0;

function deactivateAllTrips() {
  tripList.querySelectorAll(".trip-item").forEach((el) => el.classList.remove("active"));
}

/* ===== localStorage 저장/불러오기 ===== */
function saveTripsToStorage() {
  // DOM 요소는 저장할 수 없으니 순수 데이터만 저장
  const dataToSave = trips.map(({ id, name, conditions, summaryText }) => ({
    id, name, conditions, summaryText
  }));
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadTripsFromStorage() {
  const saved = JSON.parse(localStorage.getItem(TRIPS_STORAGE_KEY) || "[]");

  saved.forEach((trip) => {
    trips.push(trip);
    renderTripItem(trip);
    if (trip.id > tripIdCounter) tripIdCounter = trip.id;
  });

  updateTripEmptyState();
}

/* "+ 새 여행 만들기" 클릭 → Home으로 이동해서 바로 입력할 수 있게 */
tripAddItem.addEventListener("click", function () {
  navItems.forEach((el) => el.classList.remove("active"));
  homeNavItem.classList.add("active");
  deactivateAllTrips();
  document.getElementById("destination").focus();
  document.querySelector(".search-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});

/* 여행 항목 DOM(<li>) 생성 — 새로 만들 때/저장된 걸 불러올 때 공통으로 사용 */
function renderTripItem(trip) {
  const li = document.createElement("li");
  li.className = "trip-item";
  li.dataset.tripId = trip.id;
  li.title = trip.name;
  li.innerHTML = `
    <span class="trip-item-name"></span>
    <button type="button" class="trip-delete-btn" aria-label="여행 삭제">✕</button>
  `;
  li.querySelector(".trip-item-name").textContent = trip.name;

  li.addEventListener("click", function () {
    navItems.forEach((el) => el.classList.remove("active"));
    deactivateAllTrips();
    li.classList.add("active");
    loadTripIntoHome(trip.id);
  });

  li.querySelector(".trip-delete-btn").addEventListener("click", function (e) {
    e.stopPropagation();
    deleteTrip(trip.id, li);
  });

  tripList.insertBefore(li, tripAddItem);
  return li;
}

/* 새 여행을 서브메뉴에 추가 (+ localStorage에 저장) */
function addTripToSidebar(conditions, summaryText) {
  tripIdCounter += 1;
  const tripId = tripIdCounter;
  const tripName = `${conditions.destination} ${conditions.duration}`;
  const trip = { id: tripId, name: tripName, conditions, summaryText };

  trips.push(trip);
  const li = renderTripItem(trip);

  // 새로 만든 여행을 바로 선택된 상태로 표시
  navItems.forEach((el) => el.classList.remove("active"));
  deactivateAllTrips();
  li.classList.add("active");

  navGroup.classList.add("open");   // 서브메뉴 자동으로 펼치기
  updateTripEmptyState();
  saveTripsToStorage();
}

/* 여행 삭제 (+ localStorage에도 반영) */
function deleteTrip(tripId, li) {
  const wasActive = li.classList.contains("active");

  trips = trips.filter((t) => t.id !== tripId);
  li.remove();
  updateTripEmptyState();
  saveTripsToStorage();

  // TODO: 실제 서비스에서는 여기서 서버에 여행 삭제 API 호출

  if (wasActive) {
    resetHomeToBlank();   // 지금 보고 있던 여행을 지웠으면 Home을 빈 상태로 되돌림
  }
}

/* Home 화면(입력 폼 + 일정 카드)을 빈 상태로 초기화 */
function resetHomeToBlank() {
  tripForm.reset();
  durationPicker.clear();
  itineraryCard.querySelector(".placeholder-text").textContent = "여행 조건을 입력하면 일정이 생성됩니다.";

  navItems.forEach((el) => el.classList.remove("active"));
  homeNavItem.classList.add("active");
}

function updateTripEmptyState() {
  tripEmptyMsg.style.display = trips.length > 0 ? "none" : "block";
}

/* 사이드바에서 특정 여행 클릭 시 Home 화면에 그 여행 내용 다시 불러오기 */
function loadTripIntoHome(tripId) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;

  document.getElementById("destination").value = trip.conditions.destination;
  document.getElementById("duration").value = trip.conditions.duration;
  document.getElementById("companionCount").value = trip.conditions.companionCount || "";
  document.getElementById("companionType").value = trip.conditions.companionType || "";
  document.getElementById("budget").value = trip.conditions.budget;
  document.getElementById("travelStyle").value = trip.conditions.travelStyle;

  itineraryCard.querySelector(".placeholder-text").textContent = trip.summaryText;

  // TODO: 실제 서비스에서는 여기서 서버에 해당 여행의 상세 데이터(일정/가계부/지도) 요청
}

updateTripEmptyState();
loadTripsFromStorage();   // 페이지 열릴 때 이전에 저장해둔 여행 목록 복원

/* ===== 여행 조건 입력 폼 ===== */
const tripForm = document.getElementById("tripForm");
const itineraryCard = document.getElementById("itineraryCard");
const generateBtn = document.getElementById("generateBtn");

tripForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const destination = document.getElementById("destination").value.trim();
  const duration = document.getElementById("duration").value.trim();
  const companionCount = document.getElementById("companionCount").value.trim();
  const companionType = document.getElementById("companionType").value;
  const budget = document.getElementById("budget").value.trim();
  const travelStyle = document.getElementById("travelStyle").value;

  if (!destination || !duration) {
    alert("여행지와 기간은 꼭 입력해주세요.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "생성 중...";

  // 인원수 + 동행 유형을 사람이 읽기 좋은 문구로 조합 (예: "2명 (커플)")
  let companionText = "";
  if (companionCount && companionType) {
    companionText = `${companionCount}명 (${companionType})`;
  } else if (companionCount) {
    companionText = `${companionCount}명`;
  } else if (companionType) {
    companionText = companionType;
  }

  const conditions = { destination, duration, companionCount, companionType, companionText, budget, travelStyle };
  const summaryText = await requestAiItinerary(conditions);
  addTripToSidebar(conditions, summaryText);   // 생성 완료되면 사이드바 서브메뉴에 등록

  generateBtn.disabled = false;
  generateBtn.textContent = "AI 일정 생성";
});

/*
 * TODO: 실제 AI 연동 시 이 함수 내부를 백엔드 API 호출로 교체
 *
 * 예시:
 * const response = await fetch("http://localhost:8080/api/itinerary", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ destination, duration, companionCount, companionType, budget, travelStyle })
 * });
 * const data = await response.json();
 * renderItinerary(data);   // data.days = [{ day: 1, plan: [...] }, ...] 등
 */
async function requestAiItinerary(conditions) {
  itineraryCard.querySelector(".placeholder-text").textContent = "AI가 일정을 생성하고 있어요...";

  // ↓↓↓ 지금은 백엔드가 없어서 임시로 흉내만 냄 (실제 연동 시 삭제) ↓↓↓
  await new Promise((resolve) => setTimeout(resolve, 900));

  const summaryText =
    `"${conditions.destination}" ${conditions.duration} 일정 생성 결과가 여기에 표시됩니다. ` +
    `(조건: ${conditions.companionText || "-"} / ${conditions.budget || "-"} / ${conditions.travelStyle || "-"})`;

  itineraryCard.querySelector(".placeholder-text").textContent = summaryText;
  return summaryText;
  // ↑↑↑ 여기까지 목업(mock) 로직 ↑↑↑
}

/* ===== 여행 기간 캘린더 (flatpickr) ===== */
const durationPicker = flatpickr("#duration", {
  mode: "range",
  dateFormat: "n월 j일",     // 입력칸에 "7월 10일 ~ 7월 12일" 형태로 표시
  rangeSeparator: " ~ ",
  minDate: "today",
  locale: "ko",
  showMonths: 2               // 달력 2개월치를 한 번에 보여줌 (기간 선택 편하게)
});

document.getElementById("calendarBtn").addEventListener("click", function () {
  durationPicker.open();
});

/* ===== 여행 가계부: 카드 안에서 바로 추가/삭제 ===== */
const addExpenseBtn = document.getElementById("addExpenseBtn");
const budgetList = document.getElementById("budgetList");
const budgetEmptyMsg = document.getElementById("budgetEmptyMsg");

function updateBudgetEmptyState() {
  const hasItems = budgetList.querySelectorAll("li.budget-item").length > 0;
  budgetEmptyMsg.style.display = hasItems ? "none" : "block";
}

function removeEditRowIfExists() {
  const existing = budgetList.querySelector(".budget-edit-row");
  if (existing) existing.remove();
}

/* "+" 버튼 클릭 → 카드 안에 바로 입력 가능한 행 생성 */
addExpenseBtn.addEventListener("click", function () {
  removeEditRowIfExists();   // 이미 입력 중인 행이 있으면 새로 만들지 않고 재사용

  const editLi = document.createElement("li");
  editLi.className = "budget-edit-row";
  editLi.innerHTML = `
    <input type="text" class="budget-edit-label" placeholder="항목 (예: 간식)">
    <input type="text" class="budget-edit-amount" placeholder="금액">
    <button type="button" class="budget-confirm-btn" aria-label="추가">✓</button>
    <button type="button" class="budget-cancel-btn" aria-label="취소">✕</button>
  `;

  budgetList.appendChild(editLi); // 항상 리스트 맨 아래에 입력 행 추가

  const labelInput = editLi.querySelector(".budget-edit-label");
  const amountInput = editLi.querySelector(".budget-edit-amount");
  labelInput.focus();

  function confirmEntry() {
    const label = labelInput.value.trim();
    const amount = amountInput.value.trim().replace(/,/g, "");

    if (!label || !amount || isNaN(amount)) {
      alert("항목명과 숫자로 된 금액을 모두 입력해주세요.");
      return;
    }

    addBudgetItem(label, Number(amount));
    editLi.remove();
    // TODO: 실제 서비스에서는 여기서 서버에 지출 내역 저장 API 호출
  }

  editLi.querySelector(".budget-confirm-btn").addEventListener("click", confirmEntry);
  editLi.querySelector(".budget-cancel-btn").addEventListener("click", () => editLi.remove());

  editLi.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmEntry();
    } else if (e.key === "Escape") {
      editLi.remove();
    }
  });
});

/* 가계부 항목 실제로 리스트에 추가 (삭제 버튼 포함) */
function addBudgetItem(label, amount) {
  const li = document.createElement("li");
  li.className = "budget-item";
  li.innerHTML = `
    <span class="budget-item-label"></span>
    <span class="budget-item-amount"></span>
    <button type="button" class="budget-delete-btn" aria-label="삭제">✕</button>
  `;
  li.querySelector(".budget-item-label").textContent = label;
  li.querySelector(".budget-item-amount").textContent = `${amount.toLocaleString()}원`;

  li.querySelector(".budget-delete-btn").addEventListener("click", function () {
    li.remove();
    updateBudgetEmptyState();
    // TODO: 실제 서비스에서는 여기서 서버에 삭제 API 호출
  });

  budgetList.appendChild(li);
  updateBudgetEmptyState();
}

updateBudgetEmptyState();

/* ===== 추천 여행지 클릭 시 여행지 입력창에 자동 반영 ===== */
const recommendItems = document.querySelectorAll(".recommend-item");
const destinationInput = document.getElementById("destination");

recommendItems.forEach((item) => {
  item.addEventListener("click", function () {
    destinationInput.value = this.dataset.place;
    destinationInput.focus();
  });
});

/* ===== 로그아웃 ===== */
document.getElementById("logoutBtn").addEventListener("click", function () {
  // TODO: 실제 로그아웃 API 연동 시 토큰 삭제 등 처리 추가
  sessionStorage.removeItem("accessToken");
  window.location.href = "index.html";
});

/* ============================================================
 * common.js
 * 모든 페이지(main.html, places.html, mypage.html ...)에서 공통으로 쓰는
 *  - 사이드바 "여행 일정" 목록 렌더링/추가/삭제 (localStorage 기반)
 *  - 상단 메뉴 활성 표시
 *  - 로그아웃
 * 을 여기 한 곳에서만 관리합니다. (기존에 main.js에도 비슷한 로직이 중복돼 있던 걸 통합)
 * ============================================================ */

const TRIPS_STORAGE_KEY = "ai_travel_planner_trips";        // TODO: 백엔드 연동 시 서버 API로 교체
const ACTIVE_TRIP_KEY = "ai_travel_planner_active_trip";    // 현재 사이드바에서 선택된 여행(세션 동안만 유지)

/* ===================== 여행 데이터 CRUD (localStorage) ===================== */

function getTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_STORAGE_KEY) || "[]");
  } catch (e) {
    console.warn("여행 목록을 불러오지 못했습니다:", e);
    return [];
  }
}

function saveTrips(trips) {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
}

function getTripById(id) {
  return getTrips().find((t) => String(t.id) === String(id));
}

/* 새 여행 추가 — main.js에서 AI 일정 생성이 끝나면 이 함수를 호출 */
function addTrip(conditions, summaryText) {
  const trips = getTrips();
  const nextId = trips.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1;
  const name = `${conditions.destination} ${conditions.duration}`;
  const trip = { id: nextId, name, conditions, summaryText };

  trips.push(trip);
  saveTrips(trips);

  loadSidebarTrips();
  setActiveTripId(trip.id);

  // TODO: 실제 서비스에서는 여기서 서버에 여행 생성 API 호출

  return trip;
}

/* 여행 삭제 — 어느 페이지에서든 사이드바에서 바로 삭제 가능 */
function deleteTrip(id) {
  const trips = getTrips().filter((t) => String(t.id) !== String(id));
  saveTrips(trips);

  const wasActive = String(getActiveTripId()) === String(id);
  if (wasActive) clearActiveTripId();

  loadSidebarTrips();

  // TODO: 실제 서비스에서는 여기서 서버에 여행 삭제 API 호출

  return wasActive;
}

function getActiveTripId() {
  return sessionStorage.getItem(ACTIVE_TRIP_KEY);
}

function setActiveTripId(id) {
  sessionStorage.setItem(ACTIVE_TRIP_KEY, id);
  highlightActiveTrip(id);
}

function clearActiveTripId() {
  sessionStorage.removeItem(ACTIVE_TRIP_KEY);
  highlightActiveTrip(null);
}

/* ===================== 사이드바 "여행 일정" 서브메뉴 렌더링 ===================== */

function loadSidebarTrips() {
  const tripList = document.getElementById("tripList");
  const tripEmptyMsg = document.getElementById("tripEmptyMsg");
  const tripAddItem = document.getElementById("tripAddItem");
  if (!tripList) return;   // 사이드바가 없는 페이지 방어

  // 기존 여행 항목만 제거 (안내 문구 / 추가 버튼은 그대로 둠)
  tripList.querySelectorAll(".trip-item").forEach((el) => el.remove());

  const trips = getTrips();
  const activeId = getActiveTripId();

  trips.forEach((trip) => {
    const li = document.createElement("li");
    li.className = "trip-item";
    li.dataset.tripId = trip.id;
    li.title = trip.name;
    if (String(trip.id) === String(activeId)) li.classList.add("active");

    li.innerHTML = `
      <span class="trip-item-name"></span>
      <button type="button" class="trip-delete-btn" aria-label="여행 삭제">✕</button>
    `;
    li.querySelector(".trip-item-name").textContent = trip.name;

    li.addEventListener("click", function () {
      goToTrip(trip.id);
    });

    li.querySelector(".trip-delete-btn").addEventListener("click", function (e) {
      e.stopPropagation();
      if (!confirm(`"${trip.name}" 여행을 삭제할까요?`)) return;

      const wasActive = deleteTrip(trip.id);
      if (wasActive && typeof window.onActiveTripCleared === "function") {
        window.onActiveTripCleared();   // main.js: Home 화면을 빈 상태로 초기화
      }
    });

    tripList.insertBefore(li, tripAddItem);
  });

  if (tripEmptyMsg) tripEmptyMsg.style.display = trips.length > 0 ? "none" : "block";
}

/* 사이드바 여행 클릭 → main.html로 이동해서 해당 여행 불러오기
 * (이미 main.html에 있다면 페이지 이동 없이 바로 불러옴 - main.js가 window.onTripSelected를 정의) */
function goToTrip(tripId) {
  setActiveTripId(tripId);

  if (typeof window.onTripSelected === "function") {
    window.onTripSelected(tripId);
  } else {
    window.location.href = "main.html";
  }
}

function highlightActiveTrip(id) {
  const tripList = document.getElementById("tripList");
  if (tripList) {
    tripList.querySelectorAll(".trip-item").forEach((el) => {
      el.classList.toggle("active", !!id && String(el.dataset.tripId) === String(id));
    });
  }

  const navGroup = document.querySelector(".nav-group");
  if (navGroup && id) navGroup.classList.add("open");   // 여행이 선택되면 서브메뉴 자동으로 펼치기

  if (id) {
    // 여행이 선택된 상태면 상단 메뉴(Home 등)의 active 표시는 끔
    document.querySelectorAll(".nav-item:not(.nav-group-toggle)").forEach((el) => el.classList.remove("active"));
  }
}

/* ===================== 상단 메뉴(nav-item) ===================== */

function initSidebarNav() {
  const navItems = document.querySelectorAll(".nav-item:not(.nav-group-toggle)");
  const currentPage = location.pathname.split("/").pop() || "main.html";

  navItems.forEach((item) => {
    const href = item.getAttribute("href");

    // 아직 페이지가 없는 메뉴("#")가 아니고, 지금 보고 있는 페이지와 같으면 활성 표시
    if (href === currentPage && !getActiveTripId()) {
      item.classList.add("active");
    }

    item.addEventListener("click", function (e) {
      if (!href || href === "#") {
        e.preventDefault();
        navItems.forEach((el) => el.classList.remove("active"));
        this.classList.add("active");
        clearActiveTripId();
        console.log("아직 준비되지 않은 메뉴입니다:", this.dataset.target);
      }
      // href가 실제 페이지면 그대로 이동 (활성 표시는 다음 페이지 로드시 위 로직이 처리)
    });
  });

  /* "여행 일정" 펼침/접힘 */
  const scheduleToggle = document.getElementById("scheduleToggle");
  if (scheduleToggle) {
    const navGroup = scheduleToggle.closest(".nav-group");
    scheduleToggle.addEventListener("click", () => navGroup.classList.toggle("open"));
    if (getActiveTripId()) navGroup.classList.add("open");
  }

  /* "+ 새 여행 만들기" → Home으로 이동해서 빈 폼 보여주기 */
  const tripAddItem = document.getElementById("tripAddItem");
  if (tripAddItem) {
    tripAddItem.addEventListener("click", () => {
      clearActiveTripId();
      if (typeof window.onNewTripRequested === "function") {
        window.onNewTripRequested();   // main.js: 이미 main.html이면 폼만 초기화하고 포커스
      } else {
        window.location.href = "main.html";
      }
    });
  }
}

/* ===================== 로그아웃 (모든 페이지 공통) ===================== */

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function () {
    // TODO: 실제 로그아웃 API 연동 시 토큰 삭제 등 처리 추가
    sessionStorage.removeItem("accessToken");
    clearActiveTripId();
    window.location.href = "index.html";
  });
}

/* ===================== 초기화 ===================== */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarNav();
  loadSidebarTrips();
  initLogout();
});

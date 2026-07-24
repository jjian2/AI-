/* ============================================================
 * main.js — Home 화면(main.html) 전용 로직
 * 사이드바 여행 목록 렌더링/저장/삭제/로그아웃은 common.js가 담당합니다.
 *
 * 이 파일이 담당하는 것:
 *  - 여행 조건 폼 → 실제 백엔드(/trip/generate) 호출로 AI 일정 생성
 *  - 생성된 일정을 Day/장소 카드로 렌더링
 *  - Google Maps에 장소 마커 + 경로 표시
 *  - 체크리스트 저장
 *  - 홈 화면의 간단 가계부 위젯 (카테고리 없는 라벨+금액 — 상세 관리는 budget.html)
 * ============================================================ */

const tripForm = document.getElementById("tripForm");
const itineraryCard = document.getElementById("itineraryCard");
const generateBtn = document.getElementById("generateBtn");
const destinationInput = document.getElementById("destination");

/* ===== common.js 사이드바에서 호출하는 훅(hook) 함수들 ===== */

window.onTripSelected = function (tripId) {
  loadTripIntoHome(tripId);
};

window.onNewTripRequested = function () {
  resetHomeToBlank();
  destinationInput.focus();
  document.querySelector(".search-panel").scrollIntoView({ behavior: "smooth", block: "start" });
};

window.onActiveTripCleared = function () {
  resetHomeToBlank();
};

/* 페이지 로드 시 사이드바에서 선택된 여행이 있으면 자동으로 불러오기 */
document.addEventListener("DOMContentLoaded", () => {
  const activeId = getActiveTripId();
  if (activeId) loadTripIntoHome(activeId);
});

/* ===== 여행 조건 입력 폼 → 실제 AI 일정 생성 API 호출 ===== */
tripForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const destination = destinationInput.value.trim();
  const period = document.getElementById("duration").value.trim();
  const companionCount = document.getElementById("companionCount").value.trim();
  const companionType = document.getElementById("companionType").value;
  const budgetText = document.getElementById("budget").value.trim();
  const travelStyleValue = document.getElementById("travelStyle").value;
  const travelStyleText = document.getElementById("travelStyle").selectedOptions[0].text;

  if (!destination || !period) {
    alert("여행지와 기간은 꼭 입력해주세요.");
    return;
  }

  const peopleText =
    companionCount && companionType
      ? `${companionCount}명 (${companionType})`
      : companionCount
      ? `${companionCount}명`
      : companionType || "1명";

  const budgetNumber = parseInt(budgetText.replace(/[^0-9]/g, ""), 10) || 500000;

  // 백엔드로 보낼 요청 payload
  const requestData = {
    destination,
    period,
    people: peopleText,
    budget: budgetNumber,
    style: travelStyleText,
    transportType: "대중교통"
  };

  // 사이드바/폼 복원용으로 저장해둘 조건 (payload랑 다르게 원본 입력값도 같이 보관)
  const conditions = {
    destination,
    period,
    companionCount,
    companionType,
    peopleText,
    budget: budgetNumber,
    budgetText,
    travelStyleValue,
    travelStyleText
  };

  generateBtn.disabled = true;
  generateBtn.textContent = "생성 중...";

  itineraryCard.innerHTML = `
    <h3>🕒 AI 추천 일정</h3>
    <p class="placeholder-text">AI가 일정을 생성하고 있어요...</p>
  `;

  try {
    const response = await fetch("/trip/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error("서버 응답 오류");
    }

    const data = await response.json();
    console.log("AI 응답:", data);

    if (!data.success || !data.result) {
      throw new Error("AI 일정 생성에 실패했습니다.");
    }

    const result = data.result;

    // 방문 장소 페이지에 넘길 최신 일정 저장
    localStorage.setItem("latestTrip", JSON.stringify(result));

    renderItinerary(result);
    showPlacesOnMap(result);
    addTrip(conditions, result);   // common.js: localStorage 저장 + 사이드바 갱신 + 활성 표시
  } catch (error) {
    console.error(error);
    alert("AI 일정 생성에 실패했습니다. FastAPI 서버와 Spring Boot 서버가 모두 켜져 있는지 확인해주세요.");

    itineraryCard.innerHTML = `
      <h3>🕒 AI 추천 일정</h3>
      <p class="placeholder-text">AI 일정 생성에 실패했습니다.</p>
    `;
  }

  generateBtn.disabled = false;
  generateBtn.textContent = "AI 일정 생성";
});

/* ===== 일정 카드 렌더링 (Day별 장소 카드) ===== */
function renderItinerary(result) {
  if (!result || !result.days) {
    itineraryCard.innerHTML = `
      <h3>🕒 AI 추천 일정</h3>
      <p class="placeholder-text">일정 데이터가 없습니다.</p>
    `;
    return;
  }

  itineraryCard.innerHTML = `
    <h3>🕒 ${escapeText(result.title || "AI 추천 일정")}</h3>
    <p class="placeholder-text">
      ${escapeText(result.destination || "")} · ${escapeText(result.period || "")} · ${escapeText(result.people || "")}
    </p>
  `;

  result.days.forEach((day) => {
    itineraryCard.innerHTML += `
      <div class="day-box">
        <h4>Day ${escapeText(day.day)}</h4>
        <p>${escapeText(day.summary || "")}</p>
        ${
          day.places
            ? day.places
                .map(
                  (place) => `
                    <div class="place-item">
                      <strong>${escapeText(place.time || "")}</strong>
                      <span>${escapeText(place.placeName || "")}</span>
                      <br>
                      <small>${escapeText(place.category || "")}</small>
                      <br>
                      <small>${escapeText(place.address || "")}</small>
                      <p>${escapeText(place.description || "")}</p>
                      <p>예상 비용: ${Number(place.estimatedCost || 0).toLocaleString()}원</p>
                    </div>
                  `
                )
                .join("")
            : ""
        }
      </div>
    `;
  });
}

/* 사이드바에서 특정 여행 클릭 시 Home 화면에 그 여행 내용 다시 불러오기 */
function loadTripIntoHome(tripId) {
  const trip = getTripById(tripId);   // common.js
  if (!trip) return;

  document.getElementById("destination").value = trip.conditions.destination || "";
  document.getElementById("duration").value = trip.conditions.period || "";
  document.getElementById("companionCount").value = trip.conditions.companionCount || "";
  document.getElementById("companionType").value = trip.conditions.companionType || "";
  document.getElementById("budget").value = trip.conditions.budgetText || "";
  document.getElementById("travelStyle").value = trip.conditions.travelStyleValue || "";

  renderItinerary(trip.result);
  showPlacesOnMap(trip.result);

  // 방문 장소 페이지에서도 선택한 여행을 사용
  localStorage.setItem("latestTrip", JSON.stringify(trip.result));

  // TODO: 실제 서비스에서는 여기서 서버에 해당 여행의 최신 상세 데이터를 다시 요청해도 됨
}

/* Home 화면(입력 폼 + 일정 카드 + 지도)을 빈 상태로 초기화 */
function resetHomeToBlank() {
  tripForm.reset();
  if (durationPicker) durationPicker.clear();

  itineraryCard.innerHTML = `
    <h3>🕒 AI 추천 일정</h3>
    <p class="placeholder-text">여행 조건을 입력하면 일정이 생성됩니다.</p>
  `;

  clearMapMarkers();
}

/* ===== 여행 기간 캘린더 (flatpickr) =====
 * 실제 저장은 "Y-m-d ~ Y-m-d" 형태로 하고, 입력창에는 한국어로 보기 좋게 표시 */
const durationInput = document.getElementById("duration");
const calendarBtn = document.getElementById("calendarBtn");

let durationPicker = null;

function formatKoreanDate(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

if (!durationInput) {
  console.error("날짜 입력창 #duration을 찾을 수 없습니다.");
} else if (typeof flatpickr === "undefined") {
  console.error("flatpickr 라이브러리를 불러오지 못했습니다.");
} else {
  durationPicker = flatpickr(durationInput, {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: "today",
    locale: "ko",
    showMonths: 2,
    clickOpens: true,
    allowInput: false,

    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        const [startDate, endDate] = selectedDates;
        durationInput.value = `${formatKoreanDate(startDate)} ~ ${formatKoreanDate(endDate)}`;
      }
    }
  });

  durationInput.addEventListener("click", () => durationPicker.open());
  durationInput.addEventListener("focus", () => durationPicker.open());
}

if (calendarBtn) {
  calendarBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (durationPicker) {
      durationPicker.open();
    } else {
      alert("달력 기능을 불러오지 못했습니다.");
    }
  });
}

/* ===== 홈 화면 간단 가계부 위젯 =====
 * 카테고리별 상세 관리(AI 예산 분석, OCR 등)는 budget.html에서 하고,
 * 여기는 "빠르게 하나 추가"용 간단 위젯이라 저장 키를 budget.html과 분리했습니다. */
const HOME_BUDGET_STORAGE_KEY = "ai_travel_planner_home_budget_items";

const addExpenseBtn = document.getElementById("addExpenseBtn");
const budgetList = document.getElementById("budgetList");
const budgetEmptyMsg = document.getElementById("budgetEmptyMsg");
const budgetTotal = document.getElementById("budgetTotal");

let budgetItems = [];
let budgetItemIdCounter = 0;

function saveBudgetItems() {
  localStorage.setItem(HOME_BUDGET_STORAGE_KEY, JSON.stringify(budgetItems));
}

function loadBudgetItems() {
  try {
    const savedItems = JSON.parse(localStorage.getItem(HOME_BUDGET_STORAGE_KEY) || "[]");
    budgetItems = Array.isArray(savedItems) ? savedItems : [];

    budgetItems.forEach((item) => {
      renderBudgetItem(item);
      if (Number(item.id) > budgetItemIdCounter) budgetItemIdCounter = Number(item.id);
    });
  } catch (error) {
    console.error("가계부 불러오기 실패:", error);
    budgetItems = [];
  }

  updateBudgetState();
}

function updateBudgetState() {
  if (budgetEmptyMsg) budgetEmptyMsg.style.display = budgetItems.length === 0 ? "block" : "none";
  updateBudgetTotal();
}

function updateBudgetTotal() {
  const total = budgetItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  if (budgetTotal) budgetTotal.textContent = `${total.toLocaleString()}원`;
}

function removeEditRowIfExists() {
  const existingRow = budgetList.querySelector(".budget-edit-row");
  if (existingRow) existingRow.remove();
}

addExpenseBtn.addEventListener("click", function () {
  removeEditRowIfExists();

  const editRow = document.createElement("li");
  editRow.className = "budget-edit-row";
  editRow.innerHTML = `
    <input type="text" class="budget-edit-label" placeholder="항목 (예: 점심)">
    <input type="text" class="budget-edit-amount" placeholder="금액" inputmode="numeric">
    <button type="button" class="budget-confirm-btn" aria-label="저장">✓</button>
    <button type="button" class="budget-cancel-btn" aria-label="취소">✕</button>
  `;

  budgetList.appendChild(editRow);

  const labelInput = editRow.querySelector(".budget-edit-label");
  const amountInput = editRow.querySelector(".budget-edit-amount");
  const confirmBtn = editRow.querySelector(".budget-confirm-btn");
  const cancelBtn = editRow.querySelector(".budget-cancel-btn");

  labelInput.focus();

  amountInput.addEventListener("input", function () {
    const numberOnly = this.value.replace(/[^0-9]/g, "");
    this.value = numberOnly ? Number(numberOnly).toLocaleString() : "";
  });

  function confirmExpense() {
    const label = labelInput.value.trim();
    const amount = Number(amountInput.value.replace(/[^0-9]/g, ""));

    if (!label) {
      alert("지출 항목을 입력해주세요.");
      labelInput.focus();
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("금액을 숫자로 입력해주세요.");
      amountInput.focus();
      return;
    }

    addBudgetItem(label, amount);
    editRow.remove();
    // TODO: 실제 서비스에서는 여기서 서버에 지출 내역 저장 API 호출
  }

  confirmBtn.addEventListener("click", confirmExpense);
  cancelBtn.addEventListener("click", () => editRow.remove());

  editRow.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmExpense();
    }
    if (event.key === "Escape") editRow.remove();
  });
});

function addBudgetItem(label, amount) {
  budgetItemIdCounter += 1;
  const budgetItem = { id: budgetItemIdCounter, label, amount: Number(amount) };

  budgetItems.push(budgetItem);
  renderBudgetItem(budgetItem);
  saveBudgetItems();
  updateBudgetState();
}

function renderBudgetItem(item) {
  const listItem = document.createElement("li");
  listItem.className = "budget-item";
  listItem.dataset.budgetId = item.id;

  listItem.innerHTML = `
    <span class="budget-item-label"></span>
    <span class="budget-item-amount"></span>
    <button type="button" class="budget-delete-btn" aria-label="삭제">✕</button>
  `;

  listItem.querySelector(".budget-item-label").textContent = item.label;
  listItem.querySelector(".budget-item-amount").textContent = `${Number(item.amount).toLocaleString()}원`;

  listItem.querySelector(".budget-delete-btn").addEventListener("click", function () {
    deleteBudgetItem(item.id);
  });

  budgetList.appendChild(listItem);
}

function deleteBudgetItem(itemId) {
  budgetItems = budgetItems.filter((item) => Number(item.id) !== Number(itemId));

  const targetItem = budgetList.querySelector(`[data-budget-id="${itemId}"]`);
  if (targetItem) targetItem.remove();

  saveBudgetItems();
  updateBudgetState();
  // TODO: 실제 서비스에서는 여기서 서버에 삭제 API 호출
}

loadBudgetItems();   // 페이지가 열릴 때 저장된 간단 가계부 불러오기

/* ===== 체크리스트 저장 ===== */
const CHECKLIST_STORAGE_KEY = "ai_travel_planner_checklist";
const checklistItems = document.querySelectorAll(".checklist-item");

function saveChecklist() {
  const checklistState = {};
  checklistItems.forEach((checkbox) => {
    checklistState[checkbox.value] = checkbox.checked;
  });
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistState));
}

function loadChecklist() {
  try {
    const savedState = JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || "{}");
    checklistItems.forEach((checkbox) => {
      checkbox.checked = Boolean(savedState[checkbox.value]);
    });
  } catch (error) {
    console.error("체크리스트 불러오기 실패:", error);
  }
}

checklistItems.forEach((checkbox) => checkbox.addEventListener("change", saveChecklist));
loadChecklist();

/* ===== 추천 여행지 클릭 시 여행지 입력창에 자동 반영 ===== */
const recommendItems = document.querySelectorAll(".recommend-item");

recommendItems.forEach((item) => {
  item.addEventListener("click", function () {
    destinationInput.value = this.dataset.place;
    destinationInput.focus();
  });
});

/* ============================================================
 * Google Maps 연동
 * main.html에 <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap" async defer></script>
 * 와 <div id="map">가 있어야 동작합니다.
 * ============================================================ */
let googleMap;
let googleMarkers = [];
let routePolyline = null;
let activeInfoWindow = null;

window.initMap = function () {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("지도 요소 #map을 찾을 수 없습니다.");
    return;
  }

  googleMap = new google.maps.Map(mapElement, {
    center: { lat: 34.6937, lng: 135.5023 },   // 초기 중심: 오사카 (여행지 생기면 자동으로 이동)
    zoom: 12
  });

  console.log("Google Maps 초기화 성공");
};

function clearMapMarkers() {
  googleMarkers.forEach((marker) => marker.setMap(null));
  googleMarkers = [];

  if (routePolyline) {
    routePolyline.setMap(null);
    routePolyline = null;
  }

  if (activeInfoWindow) {
    activeInfoWindow.close();
    activeInfoWindow = null;
  }
}

function showPlacesOnMap(result) {
  if (!googleMap) {
    console.error("Google Map이 아직 초기화되지 않았습니다.");
    return;
  }
  if (!result || !Array.isArray(result.days)) {
    console.error("지도에 표시할 일정 데이터가 없습니다.");
    return;
  }

  clearMapMarkers();

  const bounds = new google.maps.LatLngBounds();
  const routePath = [];
  let markerNumber = 1;

  result.days.forEach((day) => {
    if (!Array.isArray(day.places)) return;

    day.places.forEach((place) => {
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.warn("좌표가 없는 장소:", place);
        return;
      }

      const position = { lat: latitude, lng: longitude };

      const marker = new google.maps.Marker({
        position,
        map: googleMap,
        title: place.placeName || "여행 장소",
        label: { text: String(markerNumber), color: "#ffffff", fontSize: "12px", fontWeight: "700" }
      });

      const estimatedCost = Number(place.estimatedCost || 0);

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="min-width: 210px; padding: 6px; line-height: 1.6; font-family: Arial, sans-serif;">
            <strong style="font-size: 15px;">📍 ${escapeText(place.placeName || "여행 장소")}</strong>
            <div style="margin-top: 6px;">
              <b>Day ${escapeText(day.day || "")}</b>${place.time ? ` · ${escapeText(place.time)}` : ""}
            </div>
            ${place.category ? `<div>여행 유형: ${escapeText(place.category)}</div>` : ""}
            ${place.address ? `<div>주소: ${escapeText(place.address)}</div>` : ""}
            <div>예상 비용: ${estimatedCost.toLocaleString()}원</div>
            ${place.description ? `<div style="margin-top: 5px;">${escapeText(place.description)}</div>` : ""}
          </div>
        `
      });

      marker.addListener("click", function () {
        if (activeInfoWindow) activeInfoWindow.close();
        infoWindow.open({ anchor: marker, map: googleMap });
        activeInfoWindow = infoWindow;
      });

      googleMarkers.push(marker);
      routePath.push(position);
      bounds.extend(position);
      markerNumber += 1;
    });
  });

  if (routePath.length >= 2) {
    routePolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: "#1b3f9e",
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: googleMap
    });
  }

  if (routePath.length === 1) {
    googleMap.setCenter(routePath[0]);
    googleMap.setZoom(15);
  } else if (routePath.length > 1) {
    googleMap.fitBounds(bounds);
    google.maps.event.addListenerOnce(googleMap, "bounds_changed", function () {
      if (googleMap.getZoom() > 15) googleMap.setZoom(15);
    });
  } else {
    console.warn("지도에 표시할 수 있는 장소 좌표가 없습니다.");
  }
}

/* 사용자가 준 텍스트를 그대로 innerHTML에 넣으면 XSS 위험이 있어 이스케이프 처리 */
function escapeText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

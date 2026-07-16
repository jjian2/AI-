let map;
let markers = [];

/* ===== 사이드바 네비게이션 ===== */
const navItems = document.querySelectorAll(".nav-item:not(.nav-group-toggle)");

navItems.forEach((item) => {
  item.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    if (!href || href === "#") {
      e.preventDefault();
      navItems.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
      deactivateAllTrips();
      console.log("아직 준비되지 않은 메뉴입니다:", this.dataset.target);
    }
  });
});

/* ===== 여행 일정 메뉴 펼침 ===== */
const scheduleToggle = document.getElementById("scheduleToggle");
const navGroup = scheduleToggle.closest(".nav-group");

scheduleToggle.addEventListener("click", function () {
  navGroup.classList.toggle("open");
});

/* ===== 여행 목록 관리 ===== */
const tripList = document.getElementById("tripList");
const tripEmptyMsg = document.getElementById("tripEmptyMsg");
const tripAddItem = document.getElementById("tripAddItem");
const homeNavItem = document.querySelector('.nav-item[data-target="home"]');

const TRIPS_STORAGE_KEY = "ai_travel_planner_trips";

let trips = [];
let tripIdCounter = 0;

function deactivateAllTrips() {
  tripList.querySelectorAll(".trip-item").forEach((el) => el.classList.remove("active"));
}

function saveTripsToStorage() {
  const dataToSave = trips.map(({ id, name, conditions, result }) => ({
    id,
    name,
    conditions,
    result
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

tripAddItem.addEventListener("click", function () {
  navItems.forEach((el) => el.classList.remove("active"));
  homeNavItem.classList.add("active");
  deactivateAllTrips();

  document.getElementById("destination").focus();
  document.querySelector(".search-panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

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

function addTripToSidebar(conditions, result) {
  tripIdCounter += 1;

  const tripId = tripIdCounter;
  const tripName = result.title || `${conditions.destination} ${conditions.period}`;

  const trip = {
    id: tripId,
    name: tripName,
    conditions,
    result
  };

  trips.push(trip);
  const li = renderTripItem(trip);

  navItems.forEach((el) => el.classList.remove("active"));
  deactivateAllTrips();
  li.classList.add("active");

  navGroup.classList.add("open");
  updateTripEmptyState();
  saveTripsToStorage();
}

function deleteTrip(tripId, li) {
  const wasActive = li.classList.contains("active");

  trips = trips.filter((t) => t.id !== tripId);
  li.remove();

  updateTripEmptyState();
  saveTripsToStorage();

  if (wasActive) {
    resetHomeToBlank();
  }
}

function resetHomeToBlank() {
  tripForm.reset();

  if (durationPicker) {
    durationPicker.clear();
  }

  itineraryCard.innerHTML = `
    <h3>🕒 AI 추천 일정</h3>
    <p class="placeholder-text">
      여행 조건을 입력하면 일정이 생성됩니다.
    </p>
  `;

  navItems.forEach((el) => el.classList.remove("active"));
  homeNavItem.classList.add("active");
}

function updateTripEmptyState() {
  tripEmptyMsg.style.display = trips.length > 0 ? "none" : "block";
}

function loadTripIntoHome(tripId) {
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return;
  }

  document.getElementById("destination").value =
    trip.conditions.destination || "";

  document.getElementById("duration").value =
    trip.conditions.period || "";

  document.getElementById("companionCount").value =
    trip.conditions.companionCount || "";

  document.getElementById("companionType").value =
    trip.conditions.companionType || "";

  document.getElementById("budget").value =
    trip.conditions.budgetText || "";

  document.getElementById("travelStyle").value =
    trip.conditions.travelStyleValue || "";

  renderItinerary(trip.result);
  showPlacesOnMap(trip.result);

  // 방문 장소 페이지에서도 선택한 여행을 사용
  localStorage.setItem(
    "latestTrip",
    JSON.stringify(trip.result)
  );
}

/* ===== 여행 조건 입력 폼 ===== */
const tripForm = document.getElementById("tripForm");
const itineraryCard = document.getElementById("itineraryCard");
const generateBtn = document.getElementById("generateBtn");

tripForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const destination = document.getElementById("destination").value.trim();
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

  const budgetNumber = parseInt(budgetText.replace(/[^0-9]/g, "")) || 500000;

  const requestData = {
    destination: destination,
    period: period,
    people: peopleText,
    budget: budgetNumber,
    style: travelStyleText,
    transportType: "대중교통"
  };

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error("서버 응답 오류");
    }

	const data = await response.json();

	console.log("AI 응답:", data);

	if (!response.ok || !data.success || !data.result) {
	  throw new Error("AI 일정 생성에 실패했습니다.");
	}

	const result = data.result;

	/* 방문 장소 페이지에 넘길 최신 일정 저장 */
	localStorage.setItem(
	  "latestTrip",
	  JSON.stringify(result)
	);

	console.log(
	  "저장된 최신 일정:",
	  JSON.parse(localStorage.getItem("latestTrip"))
	);

	renderItinerary(result);
	showPlacesOnMap(result);
	addTripToSidebar(conditions, result);
	

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

function renderItinerary(result) {
  if (!result || !result.days) {
    itineraryCard.innerHTML = `
      <h3>🕒 AI 추천 일정</h3>
      <p class="placeholder-text">일정 데이터가 없습니다.</p>
    `;
    return;
  }

  itineraryCard.innerHTML = `
    <h3>🕒 ${result.title || "AI 추천 일정"}</h3>
    <p class="placeholder-text">
      ${result.destination || ""} · ${result.period || ""} · ${result.people || ""}
    </p>
  `;

  result.days.forEach((day) => {
    itineraryCard.innerHTML += `
      <div class="day-box">
        <h4>Day ${day.day}</h4>
        <p>${day.summary || ""}</p>

        ${
          day.places
            ? day.places
                .map(
                  (place) => `
                    <div class="place-item">
                      <strong>${place.time || ""}</strong>
                      <span>${place.placeName || ""}</span>
                      <br>
                      <small>${place.category || ""}</small>
                      <br>
                      <small>${place.address || ""}</small>
                      <p>${place.description || ""}</p>
                      <p>예상 비용: ${(place.estimatedCost || 0).toLocaleString()}원</p>
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

/* ===== 여행 기간 캘린더 ===== */
/* ===== 여행 기간 캘린더 ===== */

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

    // 입력창을 클릭해도 달력이 열리도록 설정
    clickOpens: true,
    allowInput: false,

    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        const startDate = selectedDates[0];
        const endDate = selectedDates[1];

        durationInput.value =
          `${formatKoreanDate(startDate)} ~ ${formatKoreanDate(endDate)}`;
      }
    }
  });

  durationInput.addEventListener("click", function () {
    durationPicker.open();
  });

  durationInput.addEventListener("focus", function () {
    durationPicker.open();
  });
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

/* ===== 여행 가계부 ===== */

const addExpenseBtn = document.getElementById("addExpenseBtn");
const budgetList = document.getElementById("budgetList");
const budgetEmptyMsg = document.getElementById("budgetEmptyMsg");
const budgetTotal = document.getElementById("budgetTotal");

const BUDGET_STORAGE_KEY = "ai_travel_planner_budget_items";

let budgetItems = [];
let budgetItemIdCounter = 0;

/* localStorage 저장 */
function saveBudgetItems() {
  localStorage.setItem(
    BUDGET_STORAGE_KEY,
    JSON.stringify(budgetItems)
  );
}

/* localStorage 불러오기 */
function loadBudgetItems() {
  try {
    const savedItems = JSON.parse(
      localStorage.getItem(BUDGET_STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(savedItems)) {
      budgetItems = [];
      return;
    }

    budgetItems = savedItems;

    budgetItems.forEach((item) => {
      renderBudgetItem(item);

      if (Number(item.id) > budgetItemIdCounter) {
        budgetItemIdCounter = Number(item.id);
      }
    });
  } catch (error) {
    console.error("가계부 불러오기 실패:", error);
    budgetItems = [];
  }

  updateBudgetState();
}

/* 비어 있는지 확인하고 총합 갱신 */
function updateBudgetState() {
  if (budgetEmptyMsg) {
    budgetEmptyMsg.style.display =
      budgetItems.length === 0 ? "block" : "none";
  }

  updateBudgetTotal();
}

/* 총 지출 계산 */
function updateBudgetTotal() {
  const total = budgetItems.reduce((sum, item) => {
    return sum + Number(item.amount || 0);
  }, 0);

  if (budgetTotal) {
    budgetTotal.textContent = `${total.toLocaleString()}원`;
  }
}

/* 이미 열린 입력 줄 제거 */
function removeEditRowIfExists() {
  const existingRow = budgetList.querySelector(
    ".budget-edit-row"
  );

  if (existingRow) {
    existingRow.remove();
  }
}

/* + 버튼 클릭 */
addExpenseBtn.addEventListener("click", function () {
  removeEditRowIfExists();

  const editRow = document.createElement("li");
  editRow.className = "budget-edit-row";

  editRow.innerHTML = `
    <input
      type="text"
      class="budget-edit-label"
      placeholder="항목 (예: 점심)"
    >

    <input
      type="text"
      class="budget-edit-amount"
      placeholder="금액"
      inputmode="numeric"
    >

    <button
      type="button"
      class="budget-confirm-btn"
      aria-label="저장"
    >
      ✓
    </button>

    <button
      type="button"
      class="budget-cancel-btn"
      aria-label="취소"
    >
      ✕
    </button>
  `;

  budgetList.appendChild(editRow);

  const labelInput = editRow.querySelector(
    ".budget-edit-label"
  );

  const amountInput = editRow.querySelector(
    ".budget-edit-amount"
  );

  const confirmBtn = editRow.querySelector(
    ".budget-confirm-btn"
  );

  const cancelBtn = editRow.querySelector(
    ".budget-cancel-btn"
  );

  labelInput.focus();

  /* 금액에 숫자만 입력되도록 처리 */
  amountInput.addEventListener("input", function () {
    const numberOnly = this.value.replace(/[^0-9]/g, "");

    this.value = numberOnly
      ? Number(numberOnly).toLocaleString()
      : "";
  });

  function confirmExpense() {
    const label = labelInput.value.trim();

    const amount = Number(
      amountInput.value.replace(/[^0-9]/g, "")
    );

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
  }

  confirmBtn.addEventListener("click", confirmExpense);

  cancelBtn.addEventListener("click", function () {
    editRow.remove();
  });

  editRow.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmExpense();
    }

    if (event.key === "Escape") {
      editRow.remove();
    }
  });
});

/* 새 지출 등록 */
function addBudgetItem(label, amount) {
  budgetItemIdCounter += 1;

  const budgetItem = {
    id: budgetItemIdCounter,
    label: label,
    amount: Number(amount)
  };

  budgetItems.push(budgetItem);

  renderBudgetItem(budgetItem);
  saveBudgetItems();
  updateBudgetState();
}

/* 화면에 지출 항목 출력 */
function renderBudgetItem(item) {
  const listItem = document.createElement("li");

  listItem.className = "budget-item";
  listItem.dataset.budgetId = item.id;

  listItem.innerHTML = `
    <span class="budget-item-label"></span>

    <span class="budget-item-amount"></span>

    <button
      type="button"
      class="budget-delete-btn"
      aria-label="삭제"
    >
      ✕
    </button>
  `;

  listItem.querySelector(
    ".budget-item-label"
  ).textContent = item.label;

  listItem.querySelector(
    ".budget-item-amount"
  ).textContent =
    `${Number(item.amount).toLocaleString()}원`;

  listItem.querySelector(
    ".budget-delete-btn"
  ).addEventListener("click", function () {
    deleteBudgetItem(item.id);
  });

  budgetList.appendChild(listItem);
}

/* 지출 삭제 */
function deleteBudgetItem(itemId) {
  budgetItems = budgetItems.filter(
    (item) => Number(item.id) !== Number(itemId)
  );

  const targetItem = budgetList.querySelector(
    `[data-budget-id="${itemId}"]`
  );

  if (targetItem) {
    targetItem.remove();
  }

  saveBudgetItems();
  updateBudgetState();
}

/* 페이지가 열릴 때 저장된 가계부 불러오기 */
loadBudgetItems();


/* ===== 체크리스트 저장 ===== */

const CHECKLIST_STORAGE_KEY = "ai_travel_planner_checklist";
const checklistItems = document.querySelectorAll(".checklist-item");

function saveChecklist() {
  const checklistState = {};

  checklistItems.forEach((checkbox) => {
    checklistState[checkbox.value] = checkbox.checked;
  });

  localStorage.setItem(
    CHECKLIST_STORAGE_KEY,
    JSON.stringify(checklistState)
  );
}

function loadChecklist() {
  try {
    const savedState = JSON.parse(
      localStorage.getItem(CHECKLIST_STORAGE_KEY) || "{}"
    );

    checklistItems.forEach((checkbox) => {
      checkbox.checked = Boolean(savedState[checkbox.value]);
    });
  } catch (error) {
    console.error("체크리스트 불러오기 실패:", error);
  }
}

checklistItems.forEach((checkbox) => {
  checkbox.addEventListener("change", saveChecklist);
});

loadChecklist();


/* ===== 추천 여행지 클릭 ===== */
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
  sessionStorage.removeItem("accessToken");
  window.location.href = "/";
});

/* ===== Google Maps ===== */
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
    center: {
      lat: 34.6937,
      lng: 135.5023
    },
    zoom: 12
  });

  console.log("Google Maps 초기화 성공");
};

function clearMapMarkers() {
  googleMarkers.forEach((marker) => {
    marker.setMap(null);
  });

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

function addMapMarker(latitude, longitude, title) {
  if (!googleMap) {
    console.error("Google Map이 초기화되지 않았습니다.");
    return;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.warn("올바르지 않은 좌표:", latitude, longitude);
    return;
  }

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: googleMap,
    title: title || ""
  });

  googleMarkers.push(marker);
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
    if (!Array.isArray(day.places)) {
      return;
    }

    day.places.forEach((place) => {
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.warn("좌표가 없는 장소:", place);
        return;
      }

      const position = {
        lat: latitude,
        lng: longitude
      };

      const marker = new google.maps.Marker({
        position: position,
        map: googleMap,
        title: place.placeName || "여행 장소",
        label: {
          text: String(markerNumber),
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "700"
        }
      });

      const estimatedCost = Number(place.estimatedCost || 0);

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="
            min-width: 210px;
            padding: 6px;
            line-height: 1.6;
            font-family: Arial, sans-serif;
          ">
            <strong style="font-size: 15px;">
              📍 ${escapeMapText(place.placeName || "여행 장소")}
            </strong>

            <div style="margin-top: 6px;">
              <b>Day ${escapeMapText(day.day || "")}</b>
              ${place.time ? ` · ${escapeMapText(place.time)}` : ""}
            </div>

            ${
              place.category
                ? `<div>여행 유형: ${escapeMapText(place.category)}</div>`
                : ""
            }

            ${
              place.address
                ? `<div>주소: ${escapeMapText(place.address)}</div>`
                : ""
            }

            <div>
              예상 비용: ${estimatedCost.toLocaleString()}원
            </div>

            ${
              place.description
                ? `<div style="margin-top: 5px;">
                    ${escapeMapText(place.description)}
                   </div>`
                : ""
            }
          </div>
        `
      });

      marker.addListener("click", function () {
        if (activeInfoWindow) {
          activeInfoWindow.close();
        }

        infoWindow.open({
          anchor: marker,
          map: googleMap
        });

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

    google.maps.event.addListenerOnce(
      googleMap,
      "bounds_changed",
      function () {
        if (googleMap.getZoom() > 15) {
          googleMap.setZoom(15);
        }
      }
    );
	  } else {
	    console.warn("지도에 표시할 수 있는 장소 좌표가 없습니다.");
	  }
	}

	function escapeMapText(value) {
	  return String(value ?? "")
	    .replace(/&/g, "&amp;")
	    .replace(/</g, "&lt;")
	    .replace(/>/g, "&gt;")
	    .replace(/"/g, "&quot;")
	    .replace(/'/g, "&#039;");
	}

/*
 * TODO: 실제 서비스에서는 이 mock 데이터를 백엔드 API 응답으로 교체
 * (사용자가 저장한/AI가 추천한 방문 장소 목록을 서버에서 받아와 렌더링)
 */
const placesData = [
  {
    id: 1,
    name: "경복궁",
    icon: "🏯",
    desc: "조선 왕조의 법궁. 근정전과 경회루 등 볼거리가 많은 서울 대표 고궁이에요.",
    link: "https://www.google.com/maps/search/경복궁",
    top: "28%",
    left: "22%"
  },
  {
    id: 2,
    name: "남산서울타워",
    icon: "🗼",
    desc: "서울 전경을 한눈에 볼 수 있는 전망대. 야경 명소로 유명해요.",
    link: "https://www.google.com/maps/search/남산서울타워",
    top: "45%",
    left: "62%"
  },
  {
    id: 3,
    name: "광장시장",
    icon: "🍜",
    desc: "빈대떡, 마약김밥 등 다양한 길거리 음식을 즐길 수 있는 전통시장이에요.",
    link: "https://www.google.com/maps/search/광장시장",
    top: "62%",
    left: "35%"
  },
  {
    id: 4,
    name: "해운대 해수욕장",
    icon: "🏖️",
    desc: "부산을 대표하는 해변. 여름철 물놀이와 야경 산책 모두 좋아요.",
    link: "https://www.google.com/maps/search/해운대해수욕장",
    top: "20%",
    left: "78%"
  }
];

/* ===== 지도 위 핀 렌더링 ===== */
const placesMap = document.getElementById("placesMap");
const pinTooltip = document.getElementById("pinTooltip");
const pinTooltipPhoto = document.getElementById("pinTooltipPhoto");
const pinTooltipName = document.getElementById("pinTooltipName");
const pinTooltipDesc = document.getElementById("pinTooltipDesc");
const pinTooltipLink = document.getElementById("pinTooltipLink");

let allPinButtons = [];
let hideTooltipTimer = null;

function cancelHideTooltip() {
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer);
    hideTooltipTimer = null;
  }
}

function scheduleHideTooltip() {
  cancelHideTooltip();
  hideTooltipTimer = setTimeout(hideTooltip, 150);   // 핀→툴팁으로 마우스 이동할 시간 확보
}

// 마우스가 툴팁 위에 있는 동안은 안 사라지게, 벗어나면 바로 닫힘
pinTooltip.addEventListener("mouseenter", cancelHideTooltip);
pinTooltip.addEventListener("mouseleave", hideTooltip);

placesData.forEach((place) => {
  const pin = document.createElement("button");
  pin.type = "button";
  pin.className = "map-pin";
  pin.textContent = "📍";
  pin.style.top = place.top;
  pin.style.left = place.left;
  pin.setAttribute("aria-label", place.name);

  // 마우스 올리면 정보 카드 표시
  pin.addEventListener("mouseenter", () => {
    cancelHideTooltip();
    showTooltip(place, pin);
  });
  pin.addEventListener("focus", () => showTooltip(place, pin));
  pin.addEventListener("mouseleave", scheduleHideTooltip);
  pin.addEventListener("blur", hideTooltip);

  // 핀을 클릭하면 바로 링크로 이동 (별점/리뷰 페이지)
  pin.addEventListener("click", () => {
    window.open(place.link, "_blank", "noopener");
  });

  placesMap.appendChild(pin);
  allPinButtons.push(pin);
});

function showTooltip(place, pinEl) {
  allPinButtons.forEach((p) => p.classList.remove("pin-active"));
  pinEl.classList.add("pin-active");

  pinTooltipPhoto.textContent = place.icon;
  pinTooltipName.textContent = place.name;
  pinTooltipDesc.textContent = place.desc;
  pinTooltipLink.href = place.link;

  // 핀 위치 기준으로 툴팁을 "옆(오른쪽)"에 띄우고, 공간 부족하면 왼쪽으로 보정
  const mapRect = placesMap.getBoundingClientRect();
  const pinRect = pinEl.getBoundingClientRect();
  const tooltipWidth = 220;
  const gap = 14;   // 핀과 툴팁 사이 간격

  const pinCenterX = pinRect.left - mapRect.left + pinRect.width / 2;
  const pinTopY = pinRect.top - mapRect.top;

  let left = pinCenterX + gap;   // 기본은 핀 오른쪽
  const spaceOnRight = mapRect.width - pinCenterX;

  if (spaceOnRight < tooltipWidth + gap) {
    left = pinCenterX - gap - tooltipWidth;   // 오른쪽 공간 부족하면 왼쪽으로
  }
  left = Math.max(8, Math.min(left, mapRect.width - tooltipWidth - 8));

  let top = pinTopY - 20;   // 핀 높이에 맞춰 세로 정렬
  top = Math.max(8, Math.min(top, mapRect.height - 170));

  pinTooltip.style.left = `${left}px`;
  pinTooltip.style.top = `${top}px`;
  pinTooltip.classList.add("show");
}

function hideTooltip() {
  allPinButtons.forEach((p) => p.classList.remove("pin-active"));
  pinTooltip.classList.remove("show");
}

/* ===== 리스트로 보기 렌더링 ===== */
const placesGrid = document.getElementById("placesGrid");

placesData.forEach((place) => {
  const card = document.createElement("div");
  card.className = "place-card";
  card.innerHTML = `
    <div class="place-card-photo">${place.icon}</div>
    <div class="place-card-body">
      <h4></h4>
      <p></p>
      <a href="${place.link}" target="_blank" rel="noopener">⭐ 별점/리뷰 보기 →</a>
    </div>
  `;
  card.querySelector("h4").textContent = place.name;
  card.querySelector("p").textContent = place.desc;
  placesGrid.appendChild(card);
});

/* ===== 사이드바 상호작용 (main.html과 동일한 동작) ===== */
const navItems = document.querySelectorAll(".nav-item:not(.nav-group-toggle)");

navItems.forEach((item) => {
  item.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    // 아직 안 만든 페이지("#")는 이동 막고 표시만, 실제 페이지는 정상 이동
    if (!href || href === "#") {
      e.preventDefault();
      console.log("아직 준비되지 않은 메뉴입니다:", this.dataset.target);
    }
  });
});

const scheduleToggle = document.getElementById("scheduleToggle");
const navGroup = scheduleToggle.closest(".nav-group");

scheduleToggle.addEventListener("click", function () {
  navGroup.classList.toggle("open");
});

document.getElementById("tripAddItem").addEventListener("click", function () {
  // 여행 생성은 Home 화면에서만 가능 → Home으로 이동
  window.location.href = "main.html";
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  sessionStorage.removeItem("accessToken");
  window.location.href = "index.html";
});

/*
 * 참고: 지금 이 페이지의 "여행 일정" 서브메뉴는 항상 비어있는 상태로 보여요.
 * main.html에서 생성한 여행 목록은 그 페이지의 메모리에만 저장되기 때문입니다.
 * TODO: 실제 서비스에서는 여행 목록을 백엔드(또는 최소한 localStorage)에 저장해서
 * 페이지를 이동해도 사이드바에 동일하게 표시되도록 만들어야 합니다.
 */

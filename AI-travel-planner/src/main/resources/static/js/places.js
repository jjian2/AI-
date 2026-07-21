/*
 * places.js
 * "방문 장소" 페이지 전용 로직 (실제 Google Maps + AI가 생성한 실제 일정 데이터 렌더링).
 *
 * 사이드바 여행 목록 렌더링 / 상단 메뉴 활성 표시 / 로그아웃은
 * common.js가 모든 페이지 공통으로 처리하므로 이 파일에서는 다루지 않습니다.
 *
 * TODO: 지금은 localStorage의 "latestTrip"을 읽어서 그리지만,
 * 실제 서비스에서는 백엔드가 방문 장소 목록을 내려주는 API로 교체 예정
 * (예: GET /api/trips/{tripId}/places)
 */

const savedTrip = JSON.parse(localStorage.getItem("latestTrip") || "null");

/* ===== 방문 장소 데이터 정리 (백엔드 응답 형태를 화면에서 쓰기 좋은 형태로 변환) ===== */
const placesData = [];

if (savedTrip && Array.isArray(savedTrip.days)) {
  savedTrip.days.forEach((day) => {
    (day.places || []).forEach((place) => {
      placesData.push({
        name: place.placeName || "여행 장소",
        icon: "📍",
        description: place.description || place.category || "AI가 추천한 여행 장소입니다.",
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address || "",
        time: place.time || "",
        estimatedCost: Number(place.estimatedCost || 0),
        photo: place.photoUrl || "",
        link:
          place.googleMapsUri ||
          place.placeUrl ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${place.placeName || ""} ${place.address || ""}`
          )}`
      });
    });
  });
}

/* ===== 리스트로 보기 (카드 그리드) ===== */
const placesGrid = document.getElementById("placesGrid");

function renderPlaceCards() {
  if (!placesGrid) return;

  placesGrid.innerHTML = "";

  if (placesData.length === 0) {
    placesGrid.innerHTML = `
      <p class="places-empty">
        아직 생성된 여행 장소가 없어요. 먼저 Home에서 AI 일정을 생성해주세요.
      </p>
    `;
    return;
  }

  placesData.forEach((place) => {
    const card = document.createElement("div");
    card.className = "place-card";
    card.innerHTML = `
      <div class="place-card-photo">
        <img class="place-image" alt="">
        <div class="place-image-fallback">📍</div>
      </div>
      <div class="place-card-body">
        <h4></h4>
        <p class="place-card-time"></p>
        <p class="place-card-description"></p>
        <p class="place-card-address"></p>
        <p class="place-card-cost"></p>
        <a class="place-card-link" target="_blank" rel="noopener">🗺️ Google Maps에서 보기 →</a>
      </div>
    `;

    const image = card.querySelector(".place-image");
    const fallback = card.querySelector(".place-image-fallback");

    if (place.photo) {
      image.src = place.photo;
      image.alt = place.name;
      image.style.display = "block";
      fallback.style.display = "none";
      image.addEventListener("error", () => {
        image.style.display = "none";
        fallback.style.display = "flex";
      });
    } else {
      image.style.display = "none";
      fallback.style.display = "flex";
    }

    card.querySelector("h4").textContent = place.name;

    const timeEl = card.querySelector(".place-card-time");
    if (place.time) {
      timeEl.textContent = `🕒 ${place.time}`;
    } else {
      timeEl.remove();
    }

    card.querySelector(".place-card-description").textContent = place.description;

    const addressEl = card.querySelector(".place-card-address");
    if (place.address) {
      addressEl.textContent = `📍 ${place.address}`;
    } else {
      addressEl.remove();
    }

    card.querySelector(".place-card-cost").textContent =
      `예상 비용: ${place.estimatedCost.toLocaleString()}원`;

    card.querySelector(".place-card-link").href = place.link || "#";

    placesGrid.appendChild(card);
  });
}

/* ===== 지도로 보기 (Google Maps JS API) =====
 * places.html에 <script src="https://maps.googleapis.com/maps/api/js?key=API_KEY&callback=initPlacesMap">
 * 를 넣어두면 지도 스크립트 로드가 끝난 뒤 이 함수가 자동으로 호출됩니다.
 */
let googlePlacesMap = null;
let googlePlacesMarkers = [];
let currentPlacesInfoWindow = null;

window.initPlacesMap = function () {
  const mapElement = document.getElementById("placesMap");
  if (!mapElement) return;

  googlePlacesMap = new google.maps.Map(mapElement, {
    center: { lat: 36.2, lng: 127.8 },   // 대한민국 중앙 정도, 마커 생기면 자동으로 재조정됨
    zoom: 7,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  });

  renderPlacesMapMarkers();
};

function renderPlacesMapMarkers() {
  if (!googlePlacesMap) return;

  clearPlacesMapMarkers();
  const bounds = new google.maps.LatLngBounds();

  placesData.forEach((place, index) => {
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;   // 좌표 없는 장소는 지도에서 제외

    const position = { lat, lng };

    const marker = new google.maps.Marker({
      position,
      map: googlePlacesMap,
      title: place.name,
      label: { text: String(index + 1), color: "#ffffff", fontSize: "12px", fontWeight: "700" }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="min-width:210px; padding:6px; line-height:1.6; font-family:Arial, sans-serif;">
          <strong style="font-size:15px;">📍 ${escapePlacesText(place.name)}</strong>
          <div style="margin:7px 0;">${escapePlacesText(place.description)}</div>
          <a href="${place.link}" target="_blank" rel="noopener">Google Maps에서 보기</a>
        </div>
      `
    });

    marker.addListener("click", () => {
      if (currentPlacesInfoWindow) currentPlacesInfoWindow.close();
      infoWindow.open({ anchor: marker, map: googlePlacesMap });
      currentPlacesInfoWindow = infoWindow;
    });

    googlePlacesMarkers.push(marker);
    bounds.extend(position);
  });

  if (googlePlacesMarkers.length === 1) {
    googlePlacesMap.setCenter(bounds.getCenter());
    googlePlacesMap.setZoom(15);
  } else if (googlePlacesMarkers.length > 1) {
    googlePlacesMap.fitBounds(bounds);
    google.maps.event.addListenerOnce(googlePlacesMap, "bounds_changed", () => {
      if (googlePlacesMap.getZoom() > 14) googlePlacesMap.setZoom(14);
    });
  }
}

function clearPlacesMapMarkers() {
  googlePlacesMarkers.forEach((marker) => marker.setMap(null));
  googlePlacesMarkers = [];
  if (currentPlacesInfoWindow) {
    currentPlacesInfoWindow.close();
    currentPlacesInfoWindow = null;
  }
}

function escapePlacesText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ===== 페이지 시작 ===== */
document.addEventListener("DOMContentLoaded", renderPlaceCards);

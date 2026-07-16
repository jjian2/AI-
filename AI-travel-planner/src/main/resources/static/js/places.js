/*
 * 방문 장소 페이지
 * 현재는 임시 데이터를 사용하고,
 * 이후 Spring Boot 또는 DB 응답으로 교체할 예정
 */
const savedTrip =
    JSON.parse(localStorage.getItem("latestTrip"));
/* ===== 방문 장소 데이터 ===== */

const placesData = [];

if (savedTrip && savedTrip.days) {

    savedTrip.days.forEach(day => {

        day.places.forEach(place => {

			placesData.push({
			  name: place.placeName || "여행 장소",
			  icon: "📍",

			  description:
			    place.description ||
			    place.category ||
			    "AI가 추천한 여행 장소입니다.",

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

/* ===== 장소 카드 목록 출력 ===== */

const placesGrid = document.getElementById("placesGrid");

function renderPlaceCards() {
  if (!placesGrid) {
    console.error("placesGrid 요소를 찾을 수 없습니다.");
    return;
  }

  placesGrid.innerHTML = "";

  if (placesData.length === 0) {
    placesGrid.innerHTML = `
      <p class="places-empty">
        아직 생성된 여행 장소가 없습니다.
        먼저 Home에서 AI 일정을 생성해주세요.
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

        <a
          class="place-card-link"
          target="_blank"
          rel="noopener"
        >
          🗺️ Google Maps에서 보기 →
        </a>
      </div>
    `;

    const image = card.querySelector(".place-image");
    const fallback = card.querySelector(".place-image-fallback");

    if (place.photo) {
      image.src = place.photo;
      image.alt = place.name || "여행 장소";
      image.style.display = "block";
      fallback.style.display = "none";

      image.addEventListener("error", function () {
        console.warn("장소 사진 불러오기 실패:", place.photo);

        image.style.display = "none";
        fallback.style.display = "flex";
      });
    } else {
      image.style.display = "none";
      fallback.style.display = "flex";
    }

    card.querySelector("h4").textContent =
      place.name || "여행 장소";

    const timeElement =
      card.querySelector(".place-card-time");

    if (place.time) {
      timeElement.textContent = `🕒 ${place.time}`;
    } else {
      timeElement.remove();
    }

    card.querySelector(
      ".place-card-description"
    ).textContent =
      place.description || "AI가 추천한 여행 장소입니다.";

    const addressElement =
      card.querySelector(".place-card-address");

    if (place.address) {
      addressElement.textContent = `📍 ${place.address}`;
    } else {
      addressElement.remove();
    }

    card.querySelector(
      ".place-card-cost"
    ).textContent =
      `예상 비용: ${Number(
        place.estimatedCost || 0
      ).toLocaleString()}원`;

    const linkElement =
      card.querySelector(".place-card-link");

    linkElement.href = place.link || "#";

    placesGrid.appendChild(card);
  });
}

/* ===== Google Maps ===== */

let googlePlacesMap = null;
let googlePlacesMarkers = [];
let currentPlacesInfoWindow = null;

window.initPlacesMap = function () {
  const mapElement = document.getElementById("placesMap");

  if (!mapElement) {
    console.error("placesMap 요소를 찾을 수 없습니다.");
    return;
  }

  googlePlacesMap = new google.maps.Map(mapElement, {
    center: {
      lat: 36.2,
      lng: 127.8
    },
    zoom: 7,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  });

  renderPlacesMapMarkers();

  console.log("방문 장소 Google Maps 초기화 성공");
};

function renderPlacesMapMarkers() {
  if (!googlePlacesMap) {
    console.error("Google Maps가 아직 초기화되지 않았습니다.");
    return;
  }

  clearPlacesMapMarkers();

  const bounds = new google.maps.LatLngBounds();

  placesData.forEach((place, index) => {
    const latitude = Number(place.latitude);
    const longitude = Number(place.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.warn("좌표가 올바르지 않은 장소:", place);
      return;
    }

    const position = {
      lat: latitude,
      lng: longitude
    };

    const marker = new google.maps.Marker({
      position: position,
      map: googlePlacesMap,
      title: place.name,
      label: {
        text: String(index + 1),
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "700"
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="
          min-width: 210px;
          padding: 6px;
          line-height: 1.6;
          font-family: Arial, sans-serif;
        ">
          <strong style="font-size: 15px;">
            📍 ${escapePlacesText(place.name)}
          </strong>

          <div style="
            margin-top: 7px;
            margin-bottom: 7px;
          ">
            ${escapePlacesText(place.description)}
          </div>

          <a
            href="${place.link}"
            target="_blank"
            rel="noopener"
          >
            Google Maps에서 보기
          </a>
        </div>
      `
    });

    marker.addListener("click", function () {
      if (currentPlacesInfoWindow) {
        currentPlacesInfoWindow.close();
      }

      infoWindow.open({
        anchor: marker,
        map: googlePlacesMap
      });

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

    google.maps.event.addListenerOnce(
      googlePlacesMap,
      "bounds_changed",
      function () {
        if (googlePlacesMap.getZoom() > 14) {
          googlePlacesMap.setZoom(14);
        }
      }
    );
  }
}

function clearPlacesMapMarkers() {
  googlePlacesMarkers.forEach((marker) => {
    marker.setMap(null);
  });

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

/* ===== 사이드바 ===== */

const navItems = document.querySelectorAll(
  ".nav-item:not(.nav-group-toggle)"
);

navItems.forEach((item) => {
  item.addEventListener("click", function (event) {
    const href = this.getAttribute("href");

    if (!href || href === "#") {
      event.preventDefault();

      console.log(
        "아직 준비되지 않은 메뉴입니다:",
        this.dataset.target
      );
    }
  });
});

const scheduleToggle =
  document.getElementById("scheduleToggle");

const navGroup =
  scheduleToggle?.closest(".nav-group");

if (scheduleToggle && navGroup) {
  scheduleToggle.addEventListener("click", function () {
    navGroup.classList.toggle("open");
  });
}

const tripAddItem =
  document.getElementById("tripAddItem");

if (tripAddItem) {
  tripAddItem.addEventListener("click", function () {
    window.location.href = "/main";
  });
}

/* ===== 로그아웃 ===== */

const logoutBtn =
  document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem("accessToken");
    window.location.href = "/";
  });
}

/* ===== 페이지 시작 ===== */

document.addEventListener("DOMContentLoaded", function () {
  renderPlaceCards();
});


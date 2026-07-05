# ✈️ AI Travel Planner

> **LLM & RAG 기반 개인 맞춤 여행 일정 추천 플랫폼**

AI Travel Planner는 사용자의 여행 조건(여행지, 기간, 예산, 인원, 여행 스타일, 이동수단)을 기반으로 LLM이 맞춤형 여행 일정을 생성하는 서비스입니다.

단순 일정 추천이 아닌 **LLM + RAG + 지도 API + OpenAPI + AI Agent**를 결합하여 실제 여행 계획을 생성하고, CRUD를 통해 사용자가 자유롭게 여행 일정을 관리할 수 있도록 구현하는 것을 목표로 합니다.

---

# 📌 프로젝트 목표

본 프로젝트는 AI 기술과 Spring Boot 기반 백엔드 기술을 결합한 **취업용 포트폴리오 프로젝트**입니다.

### 목표

- LLM 기반 여행 일정 생성
- RAG 기반 관광 데이터 검색
- AI Agent를 통한 외부 API 자동 호출
- Google Maps 기반 지도 서비스
- 여행 일정 CRUD 서비스
- Docker 및 AWS 기반 서비스 배포

---

# 🛠 Tech Stack

## Backend

- Java 17
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- MySQL
- Redis

## Frontend

- HTML5
- CSS3
- JavaScript
- Thymeleaf

(추후 React 적용 가능)

## AI Server

- Python
- FastAPI
- OpenAI API
- RAG
- ChromaDB
- Embedding Model
- LLM Agent

## External API

- Google Maps API
- Kakao Local API
- Weather API
- OCR API
- OpenAI API

## Infra

- Docker
- Docker Compose
- AWS EC2
- AWS RDS
- AWS S3
- GitHub Actions

---

# 🏗 System Architecture

```
                 Frontend
      HTML / CSS / JavaScript / Thymeleaf
                    │
                    ▼
             Spring Boot Backend
   (JWT / CRUD / REST API / External API)
                    │
                    ▼
               FastAPI AI Server
      (LLM / RAG / Agent / AI Service)
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
      OpenAI API          ChromaDB
         │                     │
         ▼                     ▼
      LLM 생성          관광 데이터 검색
                    │
                    ▼
      Google Maps / Kakao / Weather API
                    │
                    ▼
                  MySQL
```

---

# ✨ 주요 기능

## 👤 회원 기능

- 회원가입
- 로그인
- JWT 인증
- Spring Security
- 마이페이지

---

## 🤖 AI 여행 일정 생성

사용자가

- 여행지
- 여행 기간
- 인원
- 예산
- 여행 스타일
- 이동수단

을 입력하면 AI가

- 여행 일정 생성
- 관광지 추천
- 맛집 추천
- 예상 비용 계산
- 최적 동선 추천

을 제공합니다.

---

## 🚶 이동수단 기반 최적 동선

사용자는 이동수단을 선택할 수 있습니다.

- 🚶 도보
- 🚌 대중교통
- 🚗 렌터카

Google Maps API를 이용하여

- 이동 거리 계산
- 이동 시간 계산
- 장소 재배치
- 최적 경로 생성

을 수행합니다.

---

## 🗺 지도 서비스

Google Maps API

- 지도 표시
- 장소 마커
- 이동 경로
- 거리 계산
- 예상 이동시간

Kakao Local API

- 관광지 검색
- 맛집 검색
- 카페 검색

---

## 🌦 날씨 기반 일정 추천

Weather API를 활용하여

- 비 오는 날 → 실내 관광지 추천
- 맑은 날 → 야외 관광지 추천
- 더운 날 → 카페/실내 일정 추천

기능을 제공합니다.

---

## 📚 RAG 기반 관광 정보 검색

사용 데이터

- 한국관광공사
- Visit Korea
- 관광공사 PDF
- 축제 정보
- 관광 데이터 CSV
- 관광 데이터 JSON

### RAG Pipeline

```
Data Collection

↓

Preprocessing

↓

Chunking

↓

Embedding

↓

ChromaDB

↓

Retriever

↓

LLM

↓

Answer
```

예시 질문

- 부산 7월 축제 있어?
- 비 오는 날 부산 추천해줘
- 부모님과 제주도 여행 추천해줘

---

## 🤖 LLM Agent

Agent가 필요한 도구를 직접 호출합니다.

사용 Tool

- Weather API
- Google Maps API
- Kakao Local API
- RAG Search
- 일정 생성
- 예산 계산

예시

```
부산

↓

내일 비

↓

Weather API

↓

실내 관광지 검색

↓

Google Maps

↓

AI 일정 생성
```

---

## 💬 AI 여행 챗봇

예시

```
둘째 날 일정이 너무 빡세

↓

일정 재배치
```

```
회 먹고 싶어

↓

맛집 추가
```

```
카페 더 넣어줘

↓

일정 수정
```

---

## 💰 AI 예산 분석

사용자의 예산을 분석하여

- 숙소
- 교통
- 식비
- 쇼핑
- 입장료

를 계산하고

예산 초과 여부를 알려줍니다.

---

## 📄 OCR 영수증 등록

영수증 업로드

↓

OCR

↓

금액 추출

↓

가계부 자동 등록

---

## 😊 여행 후기 AI 분석

후기 작성

↓

AI 감성분석

↓

긍정/부정 분석

↓

키워드 추출

↓

만족도 분석

---

# 📌 CRUD

## 여행 일정

- Create
- Read
- Update
- Delete

## 방문 장소

- Create
- Read
- Update
- Delete

## 여행 가계부

- Create
- Read
- Update
- Delete

## 체크리스트

- Create
- Read
- Update
- Delete

## 여행 후기

- Create
- Read
- Update
- Delete

---

# 📊 AI 성능평가

평가 항목

- AI 응답속도
- 토큰 사용량
- 장소 중복률
- 이동거리 효율성
- RAG 검색 정확도
- 사용자 만족도

---

# ⚙ 모델 최적화

- Prompt Engineering
- JSON Output 고정
- Redis Cache
- RAG Optimization
- Chunk Size 조절
- Top-K Retrieval 조절

---

# 🔬 LLM Fine-Tuning

현재 프로젝트에서는

- Prompt Engineering
- RAG 기반 응답 최적화

를 적용하며,

향후

- 여행 일정 데이터셋 구축
- LoRA 기반 Fine-Tuning

을 통해 일정 생성 품질을 향상시킬 예정입니다.

---

# 📂 Database

### Users

- 회원 정보

### Trips

- 여행 일정

### Trip Days

- 여행 날짜별 일정

### Places

- 방문 장소

### Expenses

- 여행 가계부

### Checklists

- 체크리스트

### Reviews

- 여행 후기

---

# 🚀 Deployment

- Docker
- Docker Compose
- AWS EC2
- AWS RDS
- AWS S3
- GitHub Actions CI/CD

---

# 📋 Development Roadmap

## Step 1

- [ ] 프로젝트 생성
- [ ] 로그인 / 회원가입
- [ ] JWT 인증
- [ ] 여행 일정 CRUD

## Step 2

- [ ] FastAPI 구축
- [ ] OpenAI API
- [ ] AI 일정 생성
- [ ] JSON 응답

## Step 3

- [ ] Kakao API
- [ ] Google Maps
- [ ] 장소 검색
- [ ] 최적 동선 생성

## Step 4

- [ ] RAG 구축
- [ ] ChromaDB
- [ ] 관광 데이터 수집

## Step 5

- [ ] LLM Agent
- [ ] AI 챗봇
- [ ] 예산 분석
- [ ] 후기 감성분석

## Step 6

- [ ] Redis
- [ ] Docker
- [ ] AWS
- [ ] GitHub Actions

---

# 📄 Resume Point

- Spring Boot 기반 REST API 개발
- JWT 인증 및 Spring Security 적용
- JPA/Hibernate 기반 CRUD 구현
- FastAPI 기반 AI 서버 구축
- OpenAI API 및 LLM 활용
- RAG 파이프라인 구축
- ChromaDB 벡터 검색 구현
- LLM Agent 설계 및 구현
- Google Maps / Kakao Local API 연동
- Weather API 활용
- Docker Compose 기반 서비스 구성
- AWS EC2 / RDS 배포
- GitHub Actions 기반 CI/CD 구축



```text
AI-Travel-Planner/
│
├── README.md                # 프로젝트 소개
├── docs/
│   ├── 01_요구사항정의서.md
│   ├── 02_기술스택.md
│   ├── 03_시스템아키텍처.md
│   ├── 04_ERD.md
│   ├── 05_API명세서.md
│   ├── 06_화면설계.md
│   ├── 07_개발일정.md
│   └── 08_트러블슈팅.md
├── backend/                 # Spring Boot 백엔드
├── ai-server/               # FastAPI AI 서버
├── frontend/                # HTML/CSS/JS/Thymeleaf 화면
├── docker/                  # Docker 관련 설정
└── .github/
    └── workflows/           # GitHub Actions CI/CD 설정
```

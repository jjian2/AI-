# ✈️ AI Travel Planner

> **LLM 기반 개인 맞춤 여행 일정 추천 플랫폼**

사용자가 여행지, 기간, 예산, 인원, 여행 스타일, 이동수단을 입력하면 AI가 맞춤형 여행 일정을 생성하고, 지도, 날씨, 관광 데이터를 활용하여 최적의 여행 동선을 추천하는 서비스입니다.

---

# 📌 프로젝트 목표

기존 여행 일정 서비스와 달리 **LLM + RAG + 지도 API + 외부 OpenAPI**를 결합하여 실제 여행 계획을 생성하는 AI 서비스를 개발하는 것을 목표로 합니다.

---

# 🛠 Tech Stack

## Backend

- Java 17
- Spring Boot
- Spring Security
- JWT
- JPA (Hibernate)
- MySQL
- Redis

## Frontend

- HTML5
- CSS3
- JavaScript
- Thymeleaf

## AI Server

- Python
- FastAPI
- OpenAI API
- RAG
- ChromaDB
- LLM Agent

## External API

- Google Maps API
- Kakao Local API
- Weather API
- OpenAI API
- OCR API

## Infra

- Docker
- Docker Compose
- AWS EC2
- AWS RDS
- AWS S3
- GitHub Actions

---

# 📌 주요 기능

## 👤 회원관리

- 회원가입
- 로그인
- JWT 인증
- 마이페이지

---

## 🤖 AI 여행 일정 생성

사용자가 입력

- 여행지
- 여행 기간
- 여행 인원
- 예산
- 여행 스타일
- 이동수단

↓

AI가

- 여행 일정 생성
- 추천 관광지
- 추천 맛집
- 예상 비용
- 최적 동선

생성

---

## 🗺️ 지도 서비스

Google Maps API

- 지도 표시
- 장소 마커
- 경로 표시
- 거리 계산
- 이동시간 계산

Kakao Local API

- 맛집 검색
- 관광지 검색
- 카페 검색

---

## 🚶 이동수단 기반 최적 동선

사용자가 선택

- 🚶 도보
- 🚌 대중교통
- 🚗 렌터카

↓

Google Maps API를 활용하여

- 이동거리 계산
- 이동시간 계산
- AI 일정 자동 재배치

---

## 🌦️ 날씨 반영

Weather API

예시

비 오는 날

↓

실내 관광지 추천

맑은 날

↓

야외 관광지 추천

---

## 💬 AI 여행 챗봇

예시

> "부산에서 회 먹고 싶어"

↓

AI 추천

↓

일정 자동 수정

---

## 📚 RAG 기반 여행 추천

사용 데이터

- 한국관광공사
- Visit Korea
- 관광공사 PDF
- 축제 정보
- 관광 데이터
- CSV
- JSON

RAG Pipeline

```
Data

↓

Preprocessing

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

---

## 🤖 LLM Agent

Agent가 필요한 도구를 직접 호출합니다.

사용 Tool

- Weather API
- Google Maps API
- Kakao Local API
- RAG Search

예시

```
부산

↓

비 오는지 확인

↓

실내 관광지 검색

↓

일정 생성
```

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

# 💰 AI 예산 분석

예산

↓

숙소

↓

교통

↓

식비

↓

총 비용 계산

↓

예산 초과 여부 분석

---

# 🧾 OCR

영수증 업로드

↓

OCR

↓

자동 가계부 등록

---

# 📊 후기 분석

사용자가 후기 작성

↓

AI 감성분석

↓

긍정 / 부정 분석

↓

키워드 추출

---

# 🐳 Docker

Docker Compose

- Spring Boot
- FastAPI
- MySQL
- Redis

통합 실행

---

# ☁️ AWS

- EC2
- RDS
- S3

배포 예정

---

# 🚀 GitHub Actions

자동

- Build
- Test
- Deploy

---

# 📈 AI 성능평가

평가 항목

- 응답속도
- 토큰 사용량
- 이동거리
- 장소 중복률
- RAG 검색 정확도

---

# 🔧 모델 최적화

- Prompt Engineering
- JSON Output
- Redis Cache
- RAG Optimization

---

# 🎯 프로젝트 아키텍처

```
Frontend
(HTML/CSS/JavaScript)

↓

Spring Boot

↓

FastAPI

↓

OpenAI

↓

RAG

↓

ChromaDB

↓

MySQL

↓

Google Maps
Kakao API
Weather API
```

---

# 📌 개발 예정

- [ ] 로그인 / 회원가입
- [ ] JWT 인증
- [ ] 여행 일정 CRUD
- [ ] 장소 CRUD
- [ ] 가계부 CRUD
- [ ] 후기 CRUD
- [ ] 체크리스트 CRUD
- [ ] AI 일정 생성
- [ ] Google Maps 연동
- [ ] Kakao Local API
- [ ] Weather API
- [ ] RAG 구축
- [ ] ChromaDB 구축
- [ ] LLM Agent
- [ ] OCR
- [ ] Redis
- [ ] Docker
- [ ] AWS 배포
- [ ] GitHub Actions

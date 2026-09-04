# 🔬 BioClean 3D LIMS - 생명과학 클린룸 디지털 트윈 & 실험실 DB

> **현실감 있게 움직이는 3차원 생명과학 클린룸 환경과 연구용 LIMS(Laboratory Information Management System) 데이터베이스가 완벽하게 결합된 차세대 인터랙티브 웹 애플리케이션**

[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 핵심 특징 (Key Features)

### 1. 🌐 현실에서 살아 움직이는 3D 클린룸 디지털 트윈
- **생물안전작업대 (BSC Class II A2)**: 전면 안전유리 새시(Sash) 상하 슬라이딩 개폐, 254nm UV 살균 램프(보라색 발광) 및 청정 층류 기류(0.53 m/s) 시각화.
- **CO2 세포 배양기 (CO2 Incubator)**: 메탈 도어 및 내부 투명 유리 도어 개폐, 전면 실시간 `37.0°C / 5.0% CO2` 7-세그먼트 LED 패널, 내부 T-75 플라스크 및 페트리 디쉬.
- **-80°C 초저온 냉동고 (Ultra-Low Deep Freezer)**: 잠금 래치 해제 및 개방 시 **실시간 냉기 수증기(Frosted Mist Particles)** 분출, 스테인리스 랙 내부 크라이오 박스 시료 식별.
- **초고속 냉장 원심분리기 (High-Speed Centrifuge)**: 원터치 뚜껑(Lid) 팝업, 사용자가 설정한 RPM(최대 15,000 RPM)으로 가속 및 감속 물리 회전 애니메이션, 사운드 합성.
- **자동화 분주 로봇 암 (Automated Liquid Handler)**: 3축(X/Y/Z) 갠트리 모터 구동으로 96-well 마이크로플레이트와 시약 튜브 간 정밀 분주(Aspirate/Dispense) 왕복 시뮬레이션.
- **마그네틱 스터러 (Magnetic Stirrer)**: 삼각 플라스크 내부 배양 용액의 회오리 소용돌이(Vortex) 및 교반자(Stir Bar) 고속 회전.

### 2. 🧬 생명과학 전용 체계적 LIMS 데이터베이스
- **바이오 시료 & 세포주 DB**:
  - 포유류/미생물 세포주(HEK293T, HeLa, Jurkat, CHO-K1, iPSC 등), 플라스미드 DNA, 항체, 재조합 단백질.
  - BSL-1 / BSL-2 등급 태그, Passage(계대수), 생존율(Viability %), 3D 동결 보존 물리적 좌표(Freezer > Rack > Box > Well).
  - **3D 공간 연동 버튼**: 시료 클릭 시 카메라가 -80°C 냉동고로 즉시 비행하여 문을 열고 위치를 지목.
- **무균 시약 & 배지 DB**:
  - DMEM, FBS, Trypsin-EDTA, Pen/Strep, Lipofectamine, Phusion DNA Polymerase 등.
  - 잔여 용량 프로그레스 바, GHS 위험물 등급(Biohazard, Flammable, Toxic), 유효기간 모니터링.
- **장비 가동 & 교정 센서 DB**:
  - 실시간 온도, CO2 농도, 회전수(RPM), 기류 풍속, 압력, 교정(Calibration) 이력 및 차기 점검 디데이.
- **실험 프로토콜 런 & 체크리스트**:
  - 계대배양(Passage), 자동화 ELISA 희석 등 단계별 체크리스트 및 소요시간 트래킹.
- **ISO Class 5 (Grade B) 클린룸 환경 규격**:
  - 실시간 양압 차압(+18.5 Pa), 0.5µm/5.0µm 입자수 카운터, 48 ACH 공기순환, 99.997% HEPA 필터 모니터링.

### 3. 🎧 Web Audio API 절차적 사운드 신시사이저
- 외부 음원 파일 없이 브라우저 내장 오디오 신시사이저로 원심분리기 모터 회전음, 클린룸 기밀 도어 개폐 래치음, 로봇 비프음, 분주 흡입음을 실시간 합성하여 재생 (음소거 토글 가능).

### 4. 💾 데이터 영구 보존 & 내보내기/가져오기
- LocalStorage 자동 영구 저장 (새로고침 시 데이터 유지).
- LIMS 전체 DB JSON 백업 및 시료/시약/장비별 CSV 엑셀 내보내기 지원.
- 신규 시료 및 시약 등록 모달 지원.

---

## 🚀 빠른 시작 (Getting Started)

### 설치 및 로컬 실행
```bash
# 리포지토리 클론
git clone https://github.com/engshorts99-source/bio-cleanroom-3d-lims.git
cd bio-cleanroom-3d-lims

# 패키지 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 프로덕션 빌드
```bash
npm run build
```

---

## 🎮 3D 조작 가이드
| 동작 | 조작 방법 |
| :--- | :--- |
| **360° 시점 회전** | 마우스 좌클릭 후 드래그 |
| **공간 평행 이동** | 마우스 우클릭 후 드래그 |
| **확대 / 축소** | 마우스 휠 스크롤 |
| **장비 및 구역 바로가기** | 상단 구역 버튼 클릭 또는 DB 카드 내 `3D 뷰` 버튼 클릭 |
| **장비 직접 작동** | 3D 화면 내 장비 클릭 또는 화면 좌측 상단 컨트롤 패널 조작 |

---

## 🛠️ 기술 스택
- **프론트엔드 프레임워크**: React 18, TypeScript, Vite
- **3D 렌더링 엔진**: Three.js (r160, OrbitControls, Raycaster, PBR Shader)
- **스타일링**: Tailwind CSS, Lucide React Icons
- **상태 관리 & 스토리지**: React Context API, LocalStorage
- **오디오**: Web Audio API (Procedural Synthesizer)

---

## 📜 라이선스
MIT License

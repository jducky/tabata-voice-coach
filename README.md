# TABATA Voice Coach

음성 안내와 함께 쓰는 설치형 타바타 타이머입니다.  
현재 앱은 [index.html](/home/engis/workspace/deploy/tabata-voice-coach/index.html) 한 파일을 중심으로 동작하며, 타이머 기능과 러닝 페이스 계산 기능이 함께 들어 있습니다.

## 주요 기능

- 타바타 타이머
- TTS 음성 안내
- 운동/휴식/카운트/횟수 설정
- 러닝 페이스 변환
- 거리별 예상 기록 계산
- 목표 페이스 기준 인터벌 구간 기록 계산
- PWA 설치 지원

## 사용 방법

정적 파일 앱입니다. 별도 빌드 없이 브라우저에서 바로 열 수 있습니다.

### 가장 간단한 방법

- [index.html](/home/engis/workspace/deploy/tabata-voice-coach/index.html) 파일을 브라우저로 열기

### 로컬 서버로 보기

아무 정적 서버로 띄우면 됩니다. 예:

```bash
python3 -m http.server 8000
```

그 뒤 `http://localhost:8000/` 접속.

## 탭 설명

### 타이머

- 운동 시간, 휴식 시간, 라운드 수, 준비 시간을 설정
- 음성 안내와 효과음을 함께 사용
- 목표 횟수를 켜면 `운동 시간 ÷ 목표 횟수` 기준으로 1회당 간격 계산

### 페이스

- `km 페이스`, `시속`, `100m`, `400m`, `5K`, `10K`, `하프`, `풀코스` 간 변환
- 거리별 예상 기록
- 목표 기록 기준 페이스 계산
- 목표 페이스 기준 `100m / 200m / 400m / 800m / 1km` 인터벌 기록 계산

### 설정

- 음성 on/off
- 보이스, 속도, 피치, 볼륨
- 운동/휴식/완료 안내 문구
- 카운트다운, 남은 시간 카운트, 목표 횟수 설정

## 파일 구조

```text
index.html
manifest.json
sw.js
icons/
docs/
```

- `index.html`: 메인 앱
- `manifest.json`: PWA 설정
- `sw.js`: 서비스 워커
- `docs/pace.md`: 마라톤 구간 페이스 기준 메모

## 개발 메모

- `localhost`에서는 서비스 워커를 등록하지 않도록 처리되어 있습니다.
- 브라우저 캐시나 서비스 워커가 남아 있으면 예전 화면이 보일 수 있습니다.
- TTS 지원 여부와 음성 목록은 브라우저마다 다릅니다.

## 참고

- 페이스 예측 로직 일부는 [docs/pace.md](/home/engis/workspace/deploy/tabata-voice-coach/docs/pace.md) 의 마라톤 구간 페이스 표를 기준으로 보간합니다.

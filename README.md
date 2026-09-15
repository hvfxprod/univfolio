# UnivFolio

서울예술대학교 창작 포트폴리오 및 동문 커리어 플랫폼 프로토타입.
React + TypeScript + Vite + Tailwind CSS 기반입니다.

## Docker 배포

Docker Engine 또는 Docker Desktop(Linux containers), Compose v2가 필요합니다.

```sh
git clone https://github.com/hvfxprod/univfolio.git
cd univfolio
docker compose up -d --build
```

접속: http://localhost:8080 (원격 서버는 http://서버주소:8080)
원격 접속 시 서버 방화벽에서 해당 포트를 허용해야 합니다.
실서비스 도메인은 HTTPS 리버스 프록시 뒤에 연결하세요.

```sh
# 상태 / 로그
docker compose ps
docker compose logs -f web
# 업데이트
git pull --ff-only
docker compose up -d --build
# 종료
docker compose down
```

포트 변경: 프로젝트의 `.env`에 `PORT=3000`을 작성하고 다시 실행합니다.
`.env`는 Git과 Docker 빌드에서 제외됩니다. 기본 포트는 8080입니다.

Compose 없이 실행:

```sh
docker build -t univfolio:local .
docker run -d --name univfolio -p 8080:80 --restart unless-stopped univfolio:local
```

Node 22에서 의존성 설치, 타입 검사, Vite 빌드를 수행합니다.
최종 이미지는 Nginx로 정적 파일을 제공하며 `/healthz` 헬스체크,
SPA 경로 fallback, 빌드 자산 캐시를 포함합니다.

## 로컬 개발

Node.js 22 이상을 사용합니다.

```sh
npm ci
npm run dev
npm run lint
npm run build
```

개발 주소: http://localhost:3000

## 현재 범위

- 데이터는 브라우저 localStorage에 저장됩니다. 서버 DB나 계정 간 동기화는 없습니다.
- 도메인·프로토콜·포트가 바뀌면 브라우저 저장 공간도 달라집니다.
- 학교 인증, 지원 및 스카우트는 데모입니다.
- 결제, 타 대학 유료 열람, 논문 임베드는 기획 단계이며 구현되지 않았습니다.
- 현재 Gemini API 호출이 없으므로 API 키 없이 실행됩니다.
- 컨테이너에는 작품 데이터를 저장하지 않아 데이터 볼륨이 필요하지 않습니다.

Compose 명령 참고: https://docs.docker.com/reference/cli/docker/compose/up/

## 작품 에디터

작업 업로드는 전체 화면 블록 에디터를 엽니다. 텍스트·인용문·구분선,
이미지 파일 또는 URL 추가, 블록 이동·복제·삭제, 본문 굵게·정렬,
미리보기와 비공개 저장을 지원합니다. 기존 작품도 같은 에디터에서 수정합니다.
JPG/PNG/WebP 파일은 한 장당 15MB, 한 번에 10장까지 선택할 수 있으며
최대 1600px JPEG로 변환해 브라우저에 저장합니다(투명 배경은 흰색).
브라우저 저장 용량이 부족하면 저장 성공으로 처리하지 않고 편집 내용을 유지합니다.
이미지 서버 업로드와 계정 간 공유는 별도 백엔드가 필요합니다.

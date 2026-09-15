# UnivFolio

React + TypeScript 작품 에디터와 Node.js API, SQLite DB를 포함한 공용 데모입니다.

## Docker 배포 (TrueNAS 포함)

```sh
git clone https://github.com/hvfxprod/univfolio.git
cd univfolio
docker compose up -d --build
```

기본 주소: http://localhost:8080
TrueNAS에서 8080이 사용 중이면 `.env`에 `PORT=18080`을 설정합니다.
기존 `.env`는 업데이트 시 유지하세요.

TrueNAS ACL 때문에 Git clone이 실패하면 ZIP으로 설치·업데이트합니다.

```sh
cd /mnt/Theh_1/HVFX_DEV &&
curl -fL https://github.com/hvfxprod/univfolio/archive/refs/heads/main.zip -o /tmp/univfolio-main.zip &&
python3 -m zipfile -e /tmp/univfolio-main.zip /mnt/Theh_1/HVFX_DEV &&
cd univfolio-main &&
docker compose up -d --build
```

```sh
docker compose ps
docker compose logs --tail=100 api web
curl -f http://localhost:18080/api/health
# 종료 (DB 유지)
docker compose down
```

## 서버 저장 구조

- `web`: Nginx 정적 웹, `/api/`는 내부 API 서버로 전달합니다.
- `api`: Node.js 24 + 내장 SQLite. 호스트에 별도 API 포트를 노출하지 않습니다.
- DB: `/data/univfolio.sqlite`, WAL 모드와 트랜잭션 사용.
- 영구 저장: Docker named volume `univfolio_data`. 폴더 이름이 달라도 같은 볼륨을 사용합니다.
- 작품, 이미지(data URL), 댓글, 좋아요, 공고, 지원 내역, 스카우트, 프로필을 DB에 저장합니다.
- 브라우저에는 선택한 데모 사용자 ID만 남습니다. 이전 로컬 원본은 이관 후에도 삭제하지 않습니다.
- DB가 처음 만들어질 때만 샘플을 넣습니다. 재시작·재빌드 시 초기화하지 않습니다.
- `docker compose down`과 이미지 재빌드는 DB를 유지합니다. **`docker compose down -v` 또는 볼륨 삭제는 DB를 삭제합니다.**
- 이미지가 많아지는 서비스는 객체 저장소로 분리하는 후속 작업이 필요합니다. 현재 요청 한도는 40MB입니다.
- 단일 API 인스턴스 기준입니다. 여러 인스턴스·대학별 운영 확장 시 PostgreSQL과 인증/권한 설계를 권장합니다.

## 기존 localStorage 자료 가져오기

기존에 사용하던 동일한 브라우저와 주소(프로토콜·호스트·포트)로 접속한 뒤,
상단 **기존 브라우저 자료 가져오기**를 누릅니다.
가져오기 전 공용 DB로 복사된다는 확인을 받으며, 서버의 동일 ID는 덮어쓰지 않습니다.
새 작품·공고·제안만 추가되고 원본 브라우저 자료는 유지됩니다.
동일 ID의 기존 샘플을 수정했던 내용은 자동 덮어쓰기 대상이 아닙니다.
DB 연결 실패 시 로컬 저장으로 조용히 전환하지 않고 오류를 표시합니다.
서버 저장 실패 시 작품 에디터는 닫히지 않습니다.

## 백업 / 복구

TrueNAS/Linux 셸에서 일관된 백업을 위해 API를 정지한 후 볼륨을 보관합니다.

```sh
docker compose stop api
docker run --rm -v univfolio_data:/data:ro alpine tar cz -C /data . > univfolio-backup.tar.gz
docker compose start api
```

복구는 실행 중인 서비스와 분리된 새 빈 볼륨에서 진행합니다. 현재 볼륨에 덮어쓰지 마세요.

```sh
docker volume create univfolio_restore
docker run --rm -i -v univfolio_restore:/data alpine tar xz -C /data < univfolio-backup.tar.gz
```

검증 후 `compose.yaml` 마지막의 볼륨 `name`을 `univfolio_restore`로 변경하고 재생성합니다.
백업 파일에는 이미지·프로필·지원 내역이 포함됩니다.

## 로컬 개발과 테스트

Node.js 24를 사용합니다. 터미널 두 개에서 API와 Vite를 실행합니다.

```sh
npm ci
npm run api
# 다른 터미널
npm run dev
```

개발: http://localhost:3000 / 로컬 DB: `data/univfolio.sqlite` (Git 제외)

```sh
npm run lint
npm run build
npm run test:api
```

API 테스트는 임시 DB에서 재시작 유지, 이미지 저장, 동시 조회수 증가,
편집 충돌, 잘못된 입력 거부, 이관 중복·롤백, 지원 중복 방지를 검증합니다.

## 작품 에디터 / 운영 범위

텍스트·인용문·구분선, 이미지 파일/URL, 블록 이동·복제·삭제,
굵게·정렬, 미리보기·비공개 저장을 지원합니다.
이미지는 JPG/PNG/WebP 15MB 이하, 한 번에 10장까지 선택하며 최대 1600px JPEG로 변환합니다.

**현재는 인증 없는 공용 데모입니다.** 데모 사용자 전환은 로그인 인증이 아니며,
비공개 표시는 갤러리 숨김 기능입니다. API 수준의 비공개·소유권·대학 격리는 없습니다.
외부 공개 서비스나 실제 개인정보 운영 전에 로그인과 서버 권한 검사를 추가해야 합니다.
구독 결제, 타 대학 유료 열람, 논문 임베드는 아직 기획 단계입니다.

참고: https://docs.docker.com/engine/storage/volumes/ / https://nodejs.org/api/sqlite.html

## 링크 버튼, 영상, 제작 기간

- 에디터의 링크 버튼에서 이름과 URL을 자유롭게 추가·삭제합니다. 기존 서비스별 링크도 자동 전환합니다.
- GitHub, RISS, YouTube, Vimeo, Figma, Behance는 도메인에 따라 아이콘/서비스 표시를 붙입니다.
- 텍스트 본문에 YouTube/Vimeo 영상 URL만 붙여넣으면 영상 블록으로 변환합니다.
  기존 글이 있으면 글을 보존하고 다음 위치에 영상을 추가합니다. 동영상 버튼으로 직접 추가할 수도 있습니다.
- 영상은 공식 iframe 플레이어를 사용합니다. 원본 제공자의 비공개/도메인 제한으로 재생이 차단될 수 있으며 원본 링크를 제공합니다.
- 하단 블록 추가 영역에서 인용문·구분선을 추가합니다.
- 제작 기간은 브라우저 달력의 월 또는 일 단위를 선택합니다. 월→일 전환 시 해당 월 1일로 변환합니다.
- 기존 자유 입력 제작 기간은 달력에서 새 값을 지정하기 전까지 유지됩니다.

플레이어 참고: https://developers.google.com/youtube/player_parameters
Vimeo 비공개 링크: https://help.vimeo.com/hc/en-us/articles/12426470858001-Embedded-player-displays-This-video-does-not-exist-message

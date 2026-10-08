# BMaaS Console

베어메탈 서버를 대여해 주는 BRICKSUM의 고객사 관리자 콘솔 UI입니다. 백엔드 없이 mock 데이터로 동작하는 프론트엔드 시안입니다.

## 실행

Node.js 22 이상(20.19 이상도 가능)이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5290 을 엽니다. 포트는 5290으로 고정되어 있어서 이미 쓰고 있으면 실행되지 않습니다.

그 밖의 명령:

```bash
npm run build      # 타입 검사 + 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
npm run typecheck  # 타입 검사만
npm run lint       # oxlint
```

## Kubernetes로 띄우기

정적 파일을 nginx 이미지에 담아 올립니다. 서버 한 대라면 k3s가 가장 간단합니다(Ingress가 기본으로 포함됩니다).

```bash
# 1. 클러스터 (서버에 한 번만)
curl -sfL https://get.k3s.io | sh -

# 2. 이미지 빌드 후 k3s에 불러오기 (레지스트리 불필요)
docker build -t bmaas-console:0.1 .
docker save bmaas-console:0.1 | sudo k3s ctr images import -

# 3. 배포
sudo k3s kubectl apply -f k8s/app.yaml
sudo k3s kubectl rollout status deploy/bmaas-console
```

서버 IP의 80번 포트로 접속합니다. 레지스트리를 쓴다면 이미지를 푸시하고 `k8s/app.yaml`의 `image`만 바꾸면 됩니다.
`nginx.conf`는 `/activity` 같은 경로로 바로 들어와도 `index.html`을 돌려주도록 되어 있습니다.

## 화면

| 경로 | 내용 |
|---|---|
| `/` | Overview: 서버 상태 요약, 위치, 최근 서버, 최근 활동 |
| `/servers` | 서버 목록 (표 / 카드 전환, 상태·GPU 필터, 정렬, 열 선택) |
| `/servers/:id` | 서버 상세 (예: `/servers/bm-seoul-03`) |
| `/activity` | 이벤트 로그: 날짜 그룹, 미해소 이슈 띠, 행을 누르면 상세 드로어 |
| `/networks`, `/ssh-keys` | 준비 중 안내 화면 |
| `/design` | 디자인 시스템: 토큰, 컴포넌트, 화면 패턴을 한곳에서 확인 |

목록 화면의 검색·필터·정렬·페이지는 URL 쿼리에 들어 있어서 링크로 그대로 공유됩니다 (예: `/activity?server=bm-seoul-03&severity=warning`).

## 구성

- React 19, TypeScript, Vite, Tailwind CSS 4
- Radix UI(접근성), TanStack Table(표 상태), Recharts(차트), cmdk, sonner
- 글꼴은 Pretendard 하나이고 숫자는 `tabular-nums`로 자릿수를 맞춥니다.

```
src/
  pages/        라우트 단위 화면
  features/     화면별 컴포넌트 (overview, servers, server-detail, activity, design)
  components/   공용 컴포넌트 (ui, data, layout, common)
  mock/         mock 데이터와 선택자 (서버 48대, 이벤트 120건 등)
  styles/       디자인 토큰, 모션
```

## 참고

- mock 데이터는 고정 시드로 만들어져서 새로고침해도 같습니다. 이벤트 시각은 실행 시점을 기준으로 상대적으로 잡힙니다.
- 라이트/다크 테마를 지원합니다.
- 디자인 결정의 근거와 컴포넌트 규칙은 `/design` 화면의 설명에 적어 두었습니다.

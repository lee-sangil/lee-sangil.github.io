# 저장소 폴더 안내

이 문서는 파일을 찾을 때 참고하는 저장소 색인이다. 2026-09-30 기준으로 작성했으며, 파일 구성이 바뀌면 해당 항목을 갱신한다.

## 저장소 개요

개인 기술 블로그와 포트폴리오 웹사이트다. Jekyll과 Minimal Mistakes 테마를 기반으로 하며, 영어 글은 `_posts/`, 한국어 글은 `_ko_posts/`에 둔다. 사이트 설정은 `_config.yml`, 내비게이션 및 번역 문구는 `_data/`에서 관리한다. 주제는 컴퓨터 비전·로보틱스·수학·셰이더·Three.js·MuJoCo 등이 중심이다.

## 최상위 폴더

| 경로 | 내용과 파일을 찾을 때 |
| --- | --- |
| `_posts/` | 영어 블로그 글. 날짜 접두어 파일명으로 정렬한다. 기술 글, 연구 논문/특허 소개, 프로젝트 기록이 섞여 있다. |
| `_ko_posts/` | 한국어 블로그 글. 영어 글의 일부 번역 및 한국어 전용 글. |
| `_pages/` | 아카이브, 카테고리, 태그, 연구·프로젝트·로그 등 고정 페이지. |
| `_layouts/` | Jekyll 페이지 템플릿. `default`, `single`, `archive`, `home`, `redirect` 등 페이지 골격을 찾는다. |
| `_includes/` | 레이아웃이 삽입하는 재사용 HTML 조각. 검색·분석·댓글·내비게이션 및 글에 넣는 데모가 있다. |
| `_includes/assets/` | 게시물 안에 삽입하는 인터랙티브 예제/시각화 조각. MuJoCo, 셰이더, 다항식, 태양계 등이 있다. |
| `_data/` | `navigation.yml` 사이트 메뉴, `ui-text.yml` 테마 UI 번역 문자열. |
| `_sass/` | Minimal Mistakes 테마 SCSS 및 테마 변수/스타일. |
| `assets/` | 사이트 정적 리소스. CSS, JS, 이미지, 다운로드 파일, 모델, 태양계 데모를 포함한다. 자세한 내용은 아래 참조. |
| `redirects/` | 예전 게시물 주소를 현재 주소로 보내는 Jekyll 리다이렉트 페이지. |
| `.github/` | GitHub Actions 배포 워크플로, 이슈/PR 양식, 저장소 설정 문서. |
| `_site/` | Jekyll 빌드 결과물. 생성 디렉터리이며 `.gitignore` 대상. |
| `.jekyll-cache/` | Jekyll 빌드 캐시. 생성 디렉터리이며 `.gitignore` 대상. |
| `node_modules/` | npm 개발 도구 의존성. 생성/설치 디렉터리이며 `.gitignore` 대상. |

## `assets/` 하위 경로

| 경로 | 내용 |
| --- | --- |
| `assets/css/` | 사이트 스타일시트 진입점과 글꼴 등 CSS 리소스. |
| `assets/download/` | CV와 학위 논문 PDF. |
| `assets/image/` | 프로필/썸네일, 헤더, 파비콘, 여행·로그 사진, 텍스처. |
| `assets/image/thumbnail/larr-dvs-de-dataset/` | LARR DVS 데이터셋 관련 썸네일 이미지. |
| `assets/js/` | 사이트 검색 및 브라우저 동작 스크립트. `lunr/` 검색 라이브러리, `plugins/` 보조 플러그인, `vendor/` 외부 라이브러리. |
| `assets/model/mujoco/` | MuJoCo 시각화에 사용하는 모델 리소스. |
| `assets/solar/` | 태양계 데모 앱 정적 리소스. `js/` 실행 코드, `assets/images/`, `icons/`, `audios/`, `models/` 데모 자산. |

## 주요 루트 파일

| 파일 | 용도 |
| --- | --- |
| `_config.yml` | 사이트 메타데이터, 테마, 검색, 작성자, Jekyll 처리 및 permalink 설정. |
| `index.html` | 홈 페이지 엔트리. |
| `feed.xml` | RSS/Atom 피드 템플릿. |
| `Gemfile`, `minimal-mistakes-jekyll.gemspec` | Ruby/Jekyll 의존성과 테마 gem 정의. |
| `package.json`, `package-lock.json` | 프런트엔드 빌드 도구와 잠금 파일. |
| `Rakefile`, `banner.js` | 개발/자산 관리 작업 및 JS 배너 처리. |
| `staticman.yml` | Staticman 댓글/기여 설정. |
| `CNAME`, `robots.txt` | 사용자 지정 도메인 및 검색 엔진 크롤링 설정. |
| `README.md`, `CHANGELOG.md`, `LICENSE` | 저장소 설명, 변경 내역, 라이선스. README는 Minimal Mistakes 테마 원본 설명이 주로 담겨 있다. |

## 빠른 탐색

- 게시물 주제 검색: `_posts/`와 `_ko_posts/`에서 제목 또는 키워드 검색.
- 페이지 구성/표시 방식: `_pages/`에서 페이지를 찾고 `_layouts/`, `_includes/`에서 렌더링 구조 확인.
- 게시물 전용 데모: `_includes/assets/`와 관련 게시물의 include 사용 부분 확인.
- 사이트 메뉴 및 테마 UI 문구: `_data/navigation.yml`, `_data/ui-text.yml`.
- 스타일 변경: `assets/css/`, `_sass/`.
- 이미지/다운로드/모델: `assets/image/`, `assets/download/`, `assets/model/`.
- 배포 방식: `.github/workflows/jekyll.yml`.

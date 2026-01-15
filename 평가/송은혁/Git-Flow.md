# 📑 Git-Flow 전략 정리

## 1. 개요

* 빈센트 드리센(Vincent Driessen)이 제안한 브랜치 관리 모델
* 프로젝트 배포 주기와 개발 흐름을 체계적으로 관리하기 위한 목적

---

## 2. 5가지 핵심 브랜치

### ① Main (Master)

* 제품으로 출시될 수 있는 상태의 브랜치
* 사용자에게 배포되는 최종 단계

### ② Develop

* 다음 출시 버전을 위해 개발을 진행하는 브랜치
* 평소 개발의 중심이 되는 라인

### ③ Feature

* 새로운 기능을 개발할 때 사용
* `develop`에서 분기하며, 개발 완료 후 다시 `develop`으로 병합

### ④ Release

* 이번 기수 배포를 준비하는 단계
* `develop`에서 분기하여 버그 수정 및 버전 태깅 작업 수행
* 완료 후 `main`과 `develop` 양쪽에 병합

### ⑤ Hotfix

* 배포된 제품(`main`)에서 발생한 긴급 버그 수정용
* `main`에서 즉시 분기하여 수정 후 `main`과 `develop`에 병합

---

## 3. 브랜치 흐름 (Workflow) 요약

1. `main` 브랜치에서 `develop` 브랜치 생성
2. 기능 개발 시 `develop`에서 `feature` 브랜치 분기
3. 기능 완료 시 `feature` 브랜치를 `develop`에 병합
4. 배포 준비 시 `develop`에서 `release` 브랜치 분기
5. QA 및 버그 수정 후 `main`에 병합 및 버전 태그 생성
6. 병합된 내용을 `develop`에도 반영

---

## 4. Git-Flow 요약 테이블

| 브랜치 이름 | 분기 지점 | 병합 대상 | 특징 |
| --- | --- | --- | --- |
| **Main** | - | - | 출시 가능한 상태 유지 |
| **Develop** | Main | - | 개발 중심축 |
| **Feature** | Develop | Develop | 기능 단위 개발 |
| **Release** | Develop | Main, Develop | 배포 전 최종 점검 |
| **Hotfix** | Main | Main, Develop | 출시 버전 긴급 수정 |


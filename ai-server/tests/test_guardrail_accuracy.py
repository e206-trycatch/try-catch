"""AI 가드레일 프롬프트 정량 검증 실험

3가지 프롬프트 변형(A: 단일 boolean, B: 3축 분리, C: 현재 구현)을
50개 테스트 케이스에 대해 실험하고 카테고리별 정확도를 측정한다.

실행:
    cd ai-server
    python -m pytest tests/test_guardrail_accuracy.py -v -s
"""

import json
import os
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import pytest
from openai import OpenAI

# ai-server를 기준으로 상대 import
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.prompts.guardrail_prompt import GUARDRAIL_SYSTEM_PROMPT
from tests.prompt_variants import PROMPT_A, PROMPT_B
from tests.test_data import TEST_CASES, TEST_FRAMEWORK, TEST_PROBLEM_DESCRIPTION

# 프롬프트 변형 정의
PROMPT_VARIANTS = {
    "A": {"name": "A: 단일 boolean", "prompt": PROMPT_A},
    "B": {"name": "B: 3축 (예시 없음)", "prompt": PROMPT_B},
    "C": {"name": "C: 3축 + few-shot", "prompt": GUARDRAIL_SYSTEM_PROMPT},
}

REPETITIONS = 3          # 케이스당 반복 횟수 (다수결)
API_DELAY = 0.3          # API 호출 간 딜레이 (초)
RESULTS_DIR = Path(__file__).resolve().parent / "results"


def build_user_prompt(question: str) -> str:
    """테스트용 사용자 프롬프트 구성"""
    return f"""
**프레임워크**: {TEST_FRAMEWORK}
**문제 설명**: {TEST_PROBLEM_DESCRIPTION}
**사용자 질문**: {question}

위 정보를 바탕으로 사용자 질문을 검증해주세요.
"""


def parse_json_response(content: str) -> dict:
    """LLM 응답에서 JSON 파싱 (GuardrailService._parse_json_response 로직 재활용)"""
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)
    except json.JSONDecodeError:
        return None


def call_guardrail(client: OpenAI, system_prompt: str, question: str) -> dict | None:
    """가드레일 API 호출 후 파싱된 결과 반환"""
    try:
        response = client.chat.completions.create(
            model=settings.guardrail_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": build_user_prompt(question)},
            ],
            max_completion_tokens=2000,
        )
        content = response.choices[0].message.content
        if not content:
            return None
        return parse_json_response(content)
    except Exception as e:
        print(f"  [ERROR] API 호출 실패: {e}")
        return None


def majority_vote(results: list[bool]) -> bool:
    """다수결 판정"""
    true_count = sum(1 for r in results if r)
    return true_count > len(results) / 2


def compute_metrics(results: list[dict]) -> dict:
    """전체 및 카테고리별 지표 계산"""
    # 카테고리별 그룹핑
    by_category = defaultdict(list)
    for r in results:
        by_category[r["category"]].append(r)

    # 카테고리별 정확도
    category_metrics = {}
    for cat, items in by_category.items():
        correct = sum(1 for i in items if i["majority_passed"] == i["expected_passed"])
        total = len(items)
        category_metrics[cat] = {
            "correct": correct,
            "total": total,
            "accuracy": correct / total if total > 0 else 0,
        }

    # 전체 정확도
    all_correct = sum(m["correct"] for m in category_metrics.values())
    all_total = sum(m["total"] for m in category_metrics.values())
    overall_accuracy = all_correct / all_total if all_total > 0 else 0

    # False Positive Rate: 정상 질문(expected_passed=True)을 차단(passed=False)한 비율
    normal = by_category.get("normal_question", [])
    fp_count = sum(1 for i in normal if i["majority_passed"] is False)
    fpr = fp_count / len(normal) if normal else 0

    # False Negative Rate: 차단해야 할 질문(expected_passed=False)을 통과(passed=True)시킨 비율
    should_block = [r for r in results if r["expected_passed"] is False]
    fn_count = sum(1 for i in should_block if i["majority_passed"] is True)
    fnr = fn_count / len(should_block) if should_block else 0

    return {
        "overall_accuracy": overall_accuracy,
        "overall_correct": all_correct,
        "overall_total": all_total,
        "category_metrics": category_metrics,
        "false_positive_rate": fpr,
        "false_negative_rate": fnr,
    }


def print_result_table(all_metrics: dict[str, dict]):
    """Notion 목표 산출물 형식으로 콘솔 출력"""
    # 카테고리 표시 순서 및 한글명
    category_order = [
        ("direct_answer", "정답요구 탐지"),
        ("bypass_attempt", "우회시도 탐지"),
        ("normal_question", "정상질문 통과"),
        ("irrelevant", "무관질문 탐지"),
        ("unsafe", "욕설 탐지"),
        ("borderline", "경계케이스"),
    ]

    print("\n")
    print("=" * 100)
    print("  AI 가드레일 프롬프트 정량 검증 결과")
    print("=" * 100)

    # 헤더
    header = f"{'프롬프트':<22}"
    for _, label in category_order:
        header += f" | {label:>10}"
    header += f" | {'전체 정확도':>10}"
    print(header)
    print("-" * 100)

    # 각 프롬프트별 행
    for variant_key in ["A", "B", "C"]:
        metrics = all_metrics[variant_key]
        name = PROMPT_VARIANTS[variant_key]["name"]
        row = f"{name:<22}"
        for cat_key, _ in category_order:
            cat_m = metrics["category_metrics"].get(cat_key, {"correct": 0, "total": 0})
            row += f" | {cat_m['correct']:>4}/{cat_m['total']:<5}"
        row += f" | {metrics['overall_accuracy']:>9.1%}"
        print(row)

    print("-" * 100)

    # FPR / FNR
    print("\n  추가 지표:")
    for variant_key in ["A", "B", "C"]:
        metrics = all_metrics[variant_key]
        name = PROMPT_VARIANTS[variant_key]["name"]
        print(
            f"  {name:<22} | "
            f"FPR(정상질문 오차단): {metrics['false_positive_rate']:.1%} | "
            f"FNR(위반질문 오통과): {metrics['false_negative_rate']:.1%}"
        )

    print("=" * 100)
    print()


def save_results(all_results: dict, all_metrics: dict):
    """결과를 JSON 파일로 저장"""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = RESULTS_DIR / f"result_{timestamp}.json"

    output = {
        "timestamp": datetime.now().isoformat(),
        "model": settings.guardrail_model,
        "repetitions": REPETITIONS,
        "test_cases_count": len(TEST_CASES),
        "variants": {},
    }

    for variant_key in ["A", "B", "C"]:
        output["variants"][variant_key] = {
            "name": PROMPT_VARIANTS[variant_key]["name"],
            "results": all_results[variant_key],
            "metrics": all_metrics[variant_key],
        }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"  결과 저장: {filepath}")
    return filepath


def run_experiment():
    """전체 실험 실행"""
    client = OpenAI(
        api_key=settings.gms_api_key,
        base_url=settings.gms_base_url,
    )

    all_results = {}   # variant_key -> list[dict]
    all_metrics = {}   # variant_key -> metrics dict

    total_calls = len(PROMPT_VARIANTS) * len(TEST_CASES) * REPETITIONS
    call_count = 0

    for variant_key, variant_info in PROMPT_VARIANTS.items():
        print(f"\n{'='*60}")
        print(f"  프롬프트 {variant_info['name']} 실험 시작")
        print(f"{'='*60}")

        variant_results = []

        for case in TEST_CASES:
            raw_results = []

            for rep in range(REPETITIONS):
                call_count += 1
                print(
                    f"  [{call_count}/{total_calls}] "
                    f"프롬프트 {variant_key} | "
                    f"케이스 {case['id']:>2} ({case['category']}) | "
                    f"반복 {rep + 1}/{REPETITIONS}",
                    end="",
                )

                result = call_guardrail(
                    client, variant_info["prompt"], case["question"]
                )

                if result is not None and "passed" in result:
                    passed = bool(result["passed"])
                    raw_results.append(passed)
                    status = "PASS" if passed else "BLOCK"
                    print(f" -> {status}")
                else:
                    # 파싱 실패 시 None으로 기록 (다수결에서 제외)
                    print(" -> PARSE_ERROR")

                time.sleep(API_DELAY)

            # 다수결 판정
            if raw_results:
                majority = majority_vote(raw_results)
            else:
                majority = False  # 모든 시도 실패 시 Fail-Closed

            variant_results.append({
                "id": case["id"],
                "category": case["category"],
                "question": case["question"],
                "expected_passed": case["expected_passed"],
                "raw_results": raw_results,
                "majority_passed": majority,
                "correct": majority == case["expected_passed"],
            })

        all_results[variant_key] = variant_results
        all_metrics[variant_key] = compute_metrics(variant_results)

    return all_results, all_metrics


# ===== pytest 진입점 =====

def test_guardrail_accuracy():
    """가드레일 프롬프트 정량 검증 실험"""
    all_results, all_metrics = run_experiment()

    # 결과 표 출력
    print_result_table(all_metrics)

    # JSON 저장
    save_results(all_results, all_metrics)

    # 기본 검증: C 프롬프트의 전체 정확도가 0보다 큰지 확인
    assert all_metrics["C"]["overall_accuracy"] > 0, "C 프롬프트 정확도가 0입니다"

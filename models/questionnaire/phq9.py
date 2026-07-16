from dataclasses import asdict

# One-way dependency: this file reads PHQ-9 scoring from the fusion engine
# so the scoring rules live in exactly one place. The fusion engine has zero
# knowledge of this file.
from models.fusion import fusion_engine as fusion


PHQ9_PROMPT = "Over the last 2 weeks, how often have you been bothered by any of the following problems?"

PHQ9_ANSWER_OPTIONS = [
    {"value": 0, "label": "Not at all"},
    {"value": 1, "label": "Several days"},
    {"value": 2, "label": "More than half the days"},
    {"value": 3, "label": "Nearly every day"},
]

PHQ9_QUESTIONS = [
    {"id": 1, "text": "Little interest or pleasure in doing things"},
    {"id": 2, "text": "Feeling down, depressed, or hopeless"},
    {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much"},
    {"id": 4, "text": "Feeling tired or having little energy"},
    {"id": 5, "text": "Poor appetite or overeating"},
    {"id": 6, "text": "Feeling bad about yourself - or that you are a failure, or have let "
                       "yourself or your family down"},
    {"id": 7, "text": "Trouble concentrating on things, such as reading the newspaper or "
                       "watching television"},
    {"id": 8, "text": "Moving or speaking so slowly that other people could have noticed, or "
                       "being so fidgety/restless that you've been moving a lot more than usual"},
    {"id": 9, "text": "Thoughts that you would be better off dead, or of hurting yourself in some way"},
]

# Index of the self-harm item within PHQ9_QUESTIONS (0-indexed), kept here
# purely for frontend display purposes (e.g. to visually flag it as sensitive).
# The actual override logic already lives in 05_fusion_pipeline.score_phq9().
SELF_HARM_ITEM_INDEX = 8


def get_questions() -> dict:
    """JSON-serializable payload for the frontend to render the form from."""
    return {
        "prompt": PHQ9_PROMPT,
        "questions": PHQ9_QUESTIONS,
        "options": PHQ9_ANSWER_OPTIONS,
    }


def score_from_answers(answers: list[int]) -> dict:
    """
    answers: list of 9 ints (0-3), in the same order as PHQ9_QUESTIONS.

    Delegates to fusion.score_phq9() so the scoring rules exist in exactly
    one place. Returns a plain dict (JSON-serializable) rather than the
    PHQ9Result dataclass, for easy use in an API response.
    """
    if len(answers) != len(PHQ9_QUESTIONS):
        raise ValueError(f"Expected {len(PHQ9_QUESTIONS)} answers, got {len(answers)}")
    if not all(isinstance(a, int) and 0 <= a <= 3 for a in answers):
        raise ValueError("Each answer must be an integer between 0 and 3.")

    result = fusion.score_phq9(answers)  # PHQ9Result dataclass from 05_fusion_pipeline.py
    return asdict(result)


if __name__ == "__main__":
    demo_answers = [1, 2, 0, 1, 0, 0, 1, 0, 0]

    print(PHQ9_PROMPT + "\n")
    for q in PHQ9_QUESTIONS:
        print(f"  {q['id']}. {q['text']}")

    print("\nDemo scoring with answers:", demo_answers)
    print(score_from_answers(demo_answers))

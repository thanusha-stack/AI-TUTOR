"""
StudyMate AI - Learner Model Service
Bayesian Knowledge Tracing for mastery estimation
"""
import math
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta


class LearnerModelService:
    """Implements simplified Bayesian Knowledge Tracing."""

    # BKT parameters
    P_INIT = 0.3          # Prior probability of knowing
    P_TRANSIT = 0.1       # Probability of learning from one opportunity
    P_SLIP = 0.1          # Probability of incorrect despite knowing
    P_GUESS = 0.25        # Probability of correct despite not knowing

    def update_mastery(self, current_mastery: float, is_correct: bool,
                       difficulty: str, confidence: float = 0.5) -> dict:
        """
        Update mastery using simplified BKT.
        Returns new mastery score and confidence.
        """
        # Difficulty multiplier
        diff_map = {"easy": 0.7, "medium": 1.0, "hard": 1.3}
        diff_mult = diff_map.get(difficulty, 1.0)

        p_know = current_mastery

        if is_correct:
            # P(K|correct) = P(correct|K)*P(K) / P(correct)
            p_correct_given_know = 1 - self.P_SLIP
            p_correct_given_not_know = self.P_GUESS / diff_mult
            p_correct = p_correct_given_know * p_know + p_correct_given_not_know * (1 - p_know)

            if p_correct > 0:
                p_know_updated = (p_correct_given_know * p_know) / p_correct
            else:
                p_know_updated = p_know

            # Apply learning transition
            p_know_updated = p_know_updated + (1 - p_know_updated) * self.P_TRANSIT

            # Higher difficulty correct = bigger confidence boost
            confidence_delta = 0.05 * diff_mult
        else:
            # P(K|incorrect) = P(incorrect|K)*P(K) / P(incorrect)
            p_incorrect_given_know = self.P_SLIP
            p_incorrect_given_not_know = 1 - self.P_GUESS / diff_mult
            p_incorrect = p_incorrect_given_know * p_know + p_incorrect_given_not_know * (1 - p_know)

            if p_incorrect > 0:
                p_know_updated = (p_incorrect_given_know * p_know) / p_incorrect
            else:
                p_know_updated = p_know

            # Larger mastery drop for easier wrong answers
            penalty = 0.05 * (2.0 - diff_mult + 0.7)
            p_know_updated = max(0.0, p_know_updated - penalty)

            confidence_delta = -0.03

        # Apply forgetting factor based on time
        new_mastery = max(0.0, min(1.0, p_know_updated))
        new_confidence = max(0.0, min(1.0, confidence + confidence_delta))

        return {
            "mastery_score": round(new_mastery, 4),
            "confidence": round(new_confidence, 4)
        }

    def apply_forgetting(self, mastery: float, last_reviewed: Optional[datetime],
                          now: Optional[datetime] = None) -> float:
        """Apply forgetting curve based on time since last review."""
        if not last_reviewed:
            return mastery

        if now is None:
            now = datetime.now(timezone.utc)

        if last_reviewed.tzinfo is None:
            last_reviewed = last_reviewed.replace(tzinfo=timezone.utc)

        days_elapsed = (now - last_reviewed).total_seconds() / 86400.0

        if days_elapsed <= 0:
            return mastery

        # Ebbinghaus forgetting curve: R = e^(-t/S)
        # S (stability) depends on mastery level
        stability = 5.0 + mastery * 25.0  # Higher mastery = slower forgetting
        retention = math.exp(-days_elapsed / stability)

        return round(mastery * retention, 4)

    def detect_misconceptions(self, attempts: List[dict]) -> List[dict]:
        """Detect possible misconceptions from answer patterns."""
        misconceptions = []

        # Group by topic
        topic_attempts = {}
        for a in attempts:
            topic = a.get("topic", "Unknown")
            if topic not in topic_attempts:
                topic_attempts[topic] = []
            topic_attempts[topic].append(a)

        for topic, topic_list in topic_attempts.items():
            recent = topic_list[-5:]  # Last 5 attempts
            incorrect = [a for a in recent if not a.get("is_correct", True)]

            if len(incorrect) >= 3:
                # Check for confusion patterns
                subtopics = set(a.get("subtopic", "") for a in incorrect if a.get("subtopic"))
                if len(subtopics) >= 2:
                    subtopic_list = list(subtopics)
                    misconceptions.append({
                        "type": "confusion",
                        "topic": topic,
                        "confused_concepts": subtopic_list[:2],
                        "message": f"You appear to be confusing {subtopic_list[0]} vs {subtopic_list[1]}",
                        "recommendation": f"Review both {subtopic_list[0]} and {subtopic_list[1]} to understand the key differences."
                    })
                elif len(incorrect) >= 3:
                    misconceptions.append({
                        "type": "weak_understanding",
                        "topic": topic,
                        "message": f"Repeated mistakes in {topic} suggest weak foundational understanding.",
                        "recommendation": f"Revisit the basics of {topic} before attempting harder questions."
                    })

        return misconceptions

    def generate_study_priorities(self, mastery_data: List[dict],
                                   prerequisites: Dict[str, List[str]]) -> List[dict]:
        """Generate prioritized study recommendations."""
        priorities = []

        # Sort by mastery (lowest first)
        sorted_topics = sorted(mastery_data, key=lambda x: x.get("mastery_score", 0.5))

        for topic_data in sorted_topics:
            topic = topic_data.get("topic", "")
            mastery = topic_data.get("mastery_score", 0.5)
            confidence = topic_data.get("confidence", 0.5)
            last_reviewed = topic_data.get("last_reviewed")

            # Calculate priority score
            priority = 0.0

            # Low mastery = high priority
            priority += (1.0 - mastery) * 0.4

            # Low confidence = higher priority
            priority += (1.0 - confidence) * 0.2

            # Not reviewed recently = higher priority
            if last_reviewed:
                if isinstance(last_reviewed, str):
                    try:
                        last_reviewed = datetime.fromisoformat(last_reviewed)
                    except (ValueError, TypeError):
                        last_reviewed = None

                if last_reviewed:
                    if last_reviewed.tzinfo is None:
                        last_reviewed = last_reviewed.replace(tzinfo=timezone.utc)
                    days = (datetime.now(timezone.utc) - last_reviewed).days
                    priority += min(days / 30.0, 0.2) * 0.2

            # Prerequisite consideration
            prereqs = prerequisites.get(topic, [])
            for prereq in prereqs:
                prereq_data = next((m for m in mastery_data if m["topic"] == prereq), None)
                if prereq_data and prereq_data.get("mastery_score", 0) < 0.6:
                    priority += 0.1  # Boost if prerequisites are weak

            # Determine time allocation
            if mastery < 0.4:
                time_minutes = 25
                action = "Deep review"
            elif mastery < 0.6:
                time_minutes = 20
                action = "Review and practice"
            elif mastery < 0.8:
                time_minutes = 15
                action = "Practice questions"
            else:
                time_minutes = 10
                action = "Quick refresher"

            priorities.append({
                "topic": topic,
                "priority_score": round(priority, 3),
                "mastery": mastery,
                "action": action,
                "time_minutes": time_minutes,
                "reason": self._get_reason(mastery, confidence, last_reviewed)
            })

        # Sort by priority (highest first)
        priorities.sort(key=lambda x: x["priority_score"], reverse=True)
        return priorities

    def _get_reason(self, mastery, confidence, last_reviewed) -> str:
        reasons = []
        if mastery < 0.4:
            reasons.append("low mastery score")
        elif mastery < 0.6:
            reasons.append("moderate mastery needs improvement")
        if confidence < 0.5:
            reasons.append("low confidence in responses")
        if last_reviewed:
            if isinstance(last_reviewed, str):
                try:
                    last_reviewed = datetime.fromisoformat(last_reviewed)
                except (ValueError, TypeError):
                    last_reviewed = None
            if last_reviewed:
                if last_reviewed.tzinfo is None:
                    last_reviewed = last_reviewed.replace(tzinfo=timezone.utc)
                days = (datetime.now(timezone.utc) - last_reviewed).days
                if days > 7:
                    reasons.append(f"not reviewed in {days} days")
        if not reasons:
            reasons.append("maintaining knowledge retention")
        return "; ".join(reasons).capitalize()


# Singleton
learner_model_service = LearnerModelService()

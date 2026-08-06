"""
Barème indicatif TCF Canada (100-699) et équivalence NCLC/CLB approximative.
⚠️ Estimation pédagogique non officielle — à but d'entraînement uniquement,
ne remplace pas un test TCF Canada officiel passé chez France Éducation international.
"""

# Paliers approximatifs (% de bonnes réponses -> score TCF -> niveau CLB)
BANDS = [
    (0.95, 630, "CLB 10+ (C1/C2)"),
    (0.85, 549, "CLB 9 (B2+)"),
    (0.75, 458, "CLB 7-8 (B2)"),
    (0.60, 398, "CLB 5-6 (B1)"),
    (0.45, 331, "CLB 4 (A2+)"),
    (0.30, 250, "CLB 3 (A2)"),
    (0.0, 100, "CLB 1-2 (A1)"),
]


def score_from_ratio(ratio: float) -> tuple[int, str]:
    for threshold, score, clb in BANDS:
        if ratio >= threshold:
            return score, clb
    return 100, "CLB 1-2 (A1)"

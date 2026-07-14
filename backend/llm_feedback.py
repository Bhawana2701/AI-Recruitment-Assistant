def generate_feedback(
    match_percentage,
    matched_skills,
    missing_skills
):

    strengths = ""

    if matched_skills:
        strengths = (
            "Candidate has experience in "
            + ", ".join(matched_skills)
        )

    weaknesses = ""

    if missing_skills:
        weaknesses = (
            "Candidate is missing "
            + ", ".join(missing_skills)
        )

    recommendation = ""

    if match_percentage >= 75:
        recommendation = (
            "Strong candidate. Recommend interview."
        )

    elif match_percentage >= 50:
        recommendation = (
            "Moderate fit. Consider screening round."
        )

    else:
        recommendation = (
            "Low fit. Needs skill improvement."
        )

    return {
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendation": recommendation
    }
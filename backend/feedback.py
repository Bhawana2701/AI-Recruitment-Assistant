def generate_feedback(
    match_score,
    skill_score,
    matched_skills,
    missing_skills
):

    feedback = []

    if match_score >= 75:
        feedback.append(
            "Strong overall match for this role."
        )

    elif match_score >= 50:
        feedback.append(
            "Moderate match for this role."
        )

    else:
        feedback.append(
            "Low match for this role."
        )

    if matched_skills:
        feedback.append(
            "Matched skills: "
            + ", ".join(matched_skills)
        )

    if missing_skills:
        feedback.append(
            "Missing skills: "
            + ", ".join(missing_skills)
        )

    return feedback
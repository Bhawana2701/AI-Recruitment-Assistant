def rank_candidate(
    semantic_score,
    matched_skills,
    missing_skills
):

    skill_score = len(matched_skills) * 10

    penalty = len(missing_skills) * 5

    llm_score = semantic_score + skill_score - penalty

    return min(100, llm_score)
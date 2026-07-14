def analyze_skills(resume_text, jd_text):

    skills = [
        "python",
        "fastapi",
        "sql",
        "docker",
        "git",
        "react",
        "javascript",
        "html",
        "css",
        "node.js"
    ]

    matched_skills = []
    missing_skills = []

    resume_text = resume_text.lower()
    jd_text = jd_text.lower()

    for skill in skills:

        if skill in jd_text:

            if skill in resume_text:
                matched_skills.append(skill)

            else:
                missing_skills.append(skill)

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="recruitment_db",
    user="bhawanakandoi"
)

# Automatically commit each SQL statement
conn.autocommit = True

cursor = conn.cursor()
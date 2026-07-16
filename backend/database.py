import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="recruitment_db",
    user="bhawanakandoi"
)

# Automatically commit each SQL statement
conn.autocommit = True

cursor = conn.cursor()

# import os
# import psycopg2
# from dotenv import load_dotenv

# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")

# if not DATABASE_URL:
#     raise Exception("DATABASE_URL environment variable is not set.")

# conn = psycopg2.connect(
#     DATABASE_URL,
#     sslmode="require"
# )

# cursor = conn.cursor()


import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()
# import psycopg2

# conn = psycopg2.connect(
#     host="localhost",
#     database="recruitment_db",
#     user="bhawanakandoi"
# )

# # Automatically commit each SQL statement
# conn.autocommit = True

# cursor = conn.cursor()
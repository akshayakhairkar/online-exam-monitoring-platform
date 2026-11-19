"""
generate_data.py
----------------
Synthetic data generator for ExamGuard using Faker.
Run once to populate the database with realistic test data.

Usage:
    python generate_data.py
"""

import random
from datetime import datetime, timedelta, timezone

from faker import Faker
from app.database.database import SessionLocal
from app.models.candidate import Candidate
from app.models.exam_session import ExamSession
from app.core.security import hash_password

# Initialize Faker with Indian locale for realistic names
fake = Faker("en_IN")

# Configuration
NUM_CANDIDATES = 20
SESSION_STATUSES = ["IN_PROGRESS", "PAUSED", "SUBMITTED"]


def generate_candidates(db):
    """Generate and insert fake candidates into the database."""
    print(f"\n📋 Generating {NUM_CANDIDATES} fake candidates...")

    created_candidates = []

    for i in range(NUM_CANDIDATES):
        # Generate realistic Indian name & email
        name = fake.name()
        email = fake.unique.email()

        # Check if this email already exists
        existing = db.query(Candidate).filter(Candidate.email == email).first()
        if existing:
            print(f"  ⚠️  Skipping duplicate email: {email}")
            continue

        # Create candidate with hashed password
        candidate = Candidate(
            name=name,
            email=email,
            password_hash=hash_password("Test@12345"),  # default test password
            photo_path=None
        )

        db.add(candidate)
        db.flush()  # flush to get the auto-generated ID

        created_candidates.append(candidate)
        print(f"  ✅ Created candidate [{candidate.id}]: {name} | {email}")

    db.commit()
    return created_candidates


def generate_sessions(db, candidates):
    """Generate and insert fake exam sessions for each candidate."""
    print(f"\n📋 Generating exam sessions for {len(candidates)} candidates...")

    for candidate in candidates:
        # Random session start time: between 1 and 7 days ago
        days_ago = random.randint(1, 7)
        hours_offset = random.randint(8, 18)  # realistic exam hours: 8am to 6pm
        start_time = datetime.now(timezone.utc) - timedelta(days=days_ago) + timedelta(hours=hours_offset)

        # Pick a random session status
        status = random.choice(SESSION_STATUSES)

        # Set end_time only if session is SUBMITTED
        if status == "SUBMITTED":
            duration_hours = random.uniform(1.0, 3.0)  # 1 to 3 hours exam duration
            end_time = start_time + timedelta(hours=duration_hours)
        else:
            end_time = None

        session = ExamSession(
            candidate_id=candidate.id,
            status=status,
            start_time=start_time,
            end_time=end_time
        )

        db.add(session)
        print(f"  ✅ Session for candidate [{candidate.id}] → Status: {status}")

    db.commit()
    print("\n✅ All sessions generated successfully!")


def main():
    """Main function to run data generation."""
    print("=" * 55)
    print("   ExamGuard - Synthetic Data Generator")
    print("=" * 55)

    db = SessionLocal()

    try:
        # Step 1: Generate candidates
        candidates = generate_candidates(db)

        if not candidates:
            print("\n⚠️  No new candidates were created (all emails may already exist).")
        else:
            # Step 2: Generate sessions for each candidate
            generate_sessions(db, candidates)

        # Step 3: Print summary
        total_candidates = db.query(Candidate).count()
        total_sessions = db.query(ExamSession).count()

        print("\n" + "=" * 55)
        print("   📊 Database Summary After Generation")
        print("=" * 55)
        print(f"   Total Candidates : {total_candidates}")
        print(f"   Total Sessions   : {total_sessions}")
        print("=" * 55)
        print("   🎉 Data generation complete!")
        print("=" * 55)

    finally:
        db.close()


if __name__ == "__main__":
    main()
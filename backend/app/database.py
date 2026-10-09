"""
StudyMate AI - Database Models
SQLite + SQLAlchemy for prototype
"""
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Text, Boolean,
    DateTime, ForeignKey, JSON, Table
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timezone
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./studymate.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)
    avatar_url = Column(String, nullable=True)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    courses = relationship("Course", back_populates="user")
    mastery_records = relationship("Mastery", back_populates="user")


class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_demo = Column(Boolean, default=False)
    user = relationship("User", back_populates="courses")
    documents = relationship("Document", back_populates="course")
    topics = relationship("Topic", back_populates="course")


class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey("courses.id"))
    name = Column(String, nullable=False)
    file_type = Column(String)  # pdf, pptx, mp4
    file_path = Column(String)
    file_size = Column(Integer)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    processing_progress = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    course = relationship("Course", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(String, primary_key=True)
    document_id = Column(String, ForeignKey("documents.id"))
    course_id = Column(String)
    content = Column(Text, nullable=False)
    source_type = Column(String)
    source_name = Column(String)
    page_number = Column(Integer, nullable=True)
    slide_number = Column(Integer, nullable=True)
    video_timestamp_start = Column(String, nullable=True)
    video_timestamp_end = Column(String, nullable=True)
    topic = Column(String, nullable=True)
    subtopic = Column(String, nullable=True)
    concept = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    embedding = Column(Text, nullable=True)  # JSON-serialized vector
    chunk_index = Column(Integer, default=0)
    document = relationship("Document", back_populates="chunks")


class Topic(Base):
    __tablename__ = "topics"
    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey("courses.id"))
    name = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    parent_topic_id = Column(String, ForeignKey("topics.id"), nullable=True)
    description = Column(Text, nullable=True)
    difficulty = Column(String, default="medium")
    order_index = Column(Integer, default=0)
    course = relationship("Course", back_populates="topics")
    subtopics = relationship("Topic", backref="parent_topic_remote", remote_side=[id], lazy="select")
    concepts = relationship("Concept", back_populates="topic")
    prerequisites = relationship(
        "TopicPrerequisite",
        foreign_keys="TopicPrerequisite.topic_id",
        back_populates="topic"
    )


class Concept(Base):
    __tablename__ = "concepts"
    id = Column(String, primary_key=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    topic = relationship("Topic", back_populates="concepts")


class TopicPrerequisite(Base):
    __tablename__ = "topic_prerequisites"
    id = Column(String, primary_key=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    prerequisite_topic_id = Column(String, ForeignKey("topics.id"))
    topic = relationship("Topic", foreign_keys=[topic_id], back_populates="prerequisites")
    prerequisite = relationship("Topic", foreign_keys=[prerequisite_topic_id])


class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    title = Column(String)
    topics = Column(JSON)  # list of topic names
    difficulty = Column(String)
    question_count = Column(Integer)
    score = Column(Float, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    questions = relationship("Question", back_populates="assessment")


class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey("assessments.id"))
    course_id = Column(String)
    question_text = Column(Text, nullable=False)
    question_type = Column(String)  # mcq, short_answer, numerical
    options = Column(JSON, nullable=True)  # for MCQ
    correct_answer = Column(Text)
    explanation = Column(Text)
    topic = Column(String)
    subtopic = Column(String, nullable=True)
    difficulty = Column(String)
    source_citation = Column(Text)
    source_type = Column(String, nullable=True)
    source_location = Column(String, nullable=True)
    order_index = Column(Integer, default=0)
    embedding = Column(Text, nullable=True)
    assessment = relationship("Assessment", back_populates="questions")
    attempts = relationship("QuestionAttempt", back_populates="question")


class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    id = Column(String, primary_key=True)
    question_id = Column(String, ForeignKey("questions.id"))
    user_id = Column(String, ForeignKey("users.id"))
    user_answer = Column(Text)
    is_correct = Column(Boolean)
    time_taken = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    question = relationship("Question", back_populates="attempts")


class Mastery(Base):
    __tablename__ = "mastery"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    topic = Column(String, nullable=False)
    mastery_score = Column(Float, default=0.5)
    confidence = Column(Float, default=0.5)
    attempts = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    last_reviewed = Column(DateTime, nullable=True)
    difficulty_history = Column(JSON, default=list)
    user = relationship("User", back_populates="mastery_records")


class TutorSession(Base):
    __tablename__ = "tutor_sessions"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    messages = relationship("TutorMessage", back_populates="session", order_by="TutorMessage.created_at")


class TutorMessage(Base):
    __tablename__ = "tutor_messages"
    id = Column(String, primary_key=True)
    session_id = Column(String, ForeignKey("tutor_sessions.id"))
    role = Column(String)  # user, assistant
    content = Column(Text)
    citations = Column(JSON, nullable=True)
    is_grounded = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    session = relationship("TutorSession", back_populates="messages")


class StudyPlan(Base):
    __tablename__ = "study_plans"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    course_id = Column(String, ForeignKey("courses.id"))
    exam_date = Column(String, nullable=True)
    daily_hours = Column(Float, default=2.0)
    plan_data = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"
    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey("courses.id"))
    faithfulness = Column(Float)
    answer_relevancy = Column(Float)
    context_precision = Column(Float)
    context_recall = Column(Float)
    mastery_gain = Column(Float, nullable=True)
    question_repetition_rate = Column(Float, nullable=True)
    weak_topic_improvement = Column(Float, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db():
    Base.metadata.create_all(bind=engine)

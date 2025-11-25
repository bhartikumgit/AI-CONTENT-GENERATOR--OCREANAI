from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class DocumentType(str, enum.Enum):
    DOCX = "docx"
    PPTX = "pptx"


class FeedbackType(str, enum.Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    NONE = "none"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    topic = Column(Text, nullable=True)
    doc_type = Column(Enum(DocumentType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="projects")
    sections = relationship("DocumentSection", back_populates="project", cascade="all, delete-orphan")


class DocumentSection(Base):
    __tablename__ = "document_sections"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(300), nullable=False)  # Section heading or slide title
    content = Column(Text, nullable=True)  # Generated content
    order_index = Column(Integer, nullable=False)  # Order in document
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("Project", back_populates="sections")
    refinements = relationship("RefinementHistory", back_populates="section", cascade="all, delete-orphan")


class RefinementHistory(Base):
    __tablename__ = "refinement_history"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("document_sections.id"), nullable=False)
    prompt = Column(Text, nullable=True)  # User's refinement prompt
    previous_content = Column(Text, nullable=True)
    new_content = Column(Text, nullable=True)
    feedback = Column(Enum(FeedbackType), default=FeedbackType.NONE)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    section = relationship("DocumentSection", back_populates="refinements")

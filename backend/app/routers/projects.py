from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Project, DocumentSection, DocumentType
from app.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


class SectionCreate(BaseModel):
    title: str
    order_index: int


class ProjectCreate(BaseModel):
    title: str
    topic: str
    doc_type: DocumentType
    sections: List[SectionCreate]


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None


class SectionResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    order_index: int
    
    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: int
    title: str
    topic: Optional[str]
    doc_type: DocumentType
    created_at: datetime
    updated_at: datetime
    sections: List[SectionResponse]
    
    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    id: int
    title: str
    doc_type: DocumentType
    created_at: datetime
    section_count: int
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProjectListItem])
async def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all projects for the current user"""
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    
    return [
        ProjectListItem(
            id=p.id,
            title=p.title,
            doc_type=p.doc_type,
            created_at=p.created_at,
            section_count=len(p.sections)
        )
        for p in projects
    ]


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    # Create project
    new_project = Project(
        user_id=current_user.id,
        title=project_data.title,
        topic=project_data.topic,
        doc_type=project_data.doc_type
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Create sections
    for section_data in project_data.sections:
        new_section = DocumentSection(
            project_id=new_project.id,
            title=section_data.title,
            order_index=section_data.order_index
        )
        db.add(new_section)
    
    db.commit()
    db.refresh(new_project)
    
    return new_project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    if project_data.title is not None:
        project.title = project_data.title
    if project_data.topic is not None:
        project.topic = project_data.topic
    
    db.commit()
    db.refresh(project)
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    db.delete(project)
    db.commit()

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models import User, Project, DocumentSection, RefinementHistory, FeedbackType
from app.auth import get_current_user
from app.services.llm_service import llm_service

router = APIRouter(prefix="/generate", tags=["Generation"])


class OutlineRequest(BaseModel):
    topic: str
    doc_type: str
    num_items: int = 5


class OutlineResponse(BaseModel):
    headings: List[str]


class GenerateContentRequest(BaseModel):
    project_id: int


class RefineContentRequest(BaseModel):
    section_id: int
    prompt: str


class FeedbackRequest(BaseModel):
    section_id: int
    feedback: FeedbackType
    comment: Optional[str] = None


class ContentResponse(BaseModel):
    section_id: int
    content: str


@router.post("/outline", response_model=OutlineResponse)
async def generate_outline(
    request: OutlineRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate an AI-suggested outline"""
    headings = await llm_service.generate_outline(
        topic=request.topic,
        doc_type=request.doc_type,
        num_items=request.num_items
    )
    
    return {"headings": headings}


@router.post("/content", response_model=List[ContentResponse])
async def generate_content(
    request: GenerateContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content for all sections in a project"""
    # Get project
    project = db.query(Project).filter(
        Project.id == request.project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get sections ordered
    sections = sorted(project.sections, key=lambda s: s.order_index)
    
    results = []
    context = ""
    
    for section in sections:
        # Generate content
        print(f"[GENERATE] Generating content for section: {section.title}")
        print(f"[GENERATE] Topic: {project.topic or project.title}")
        print(f"[GENERATE] Doc type: {project.doc_type.value}")
        
        content = await llm_service.generate_content(
            topic=project.topic or project.title,
            section_title=section.title,
            doc_type=project.doc_type.value,
            context=context[:500] if context else ""  # Limit context size
        )
        
        print(f"[GENERATE] Generated content length: {len(content) if content else 0}")
        print(f"[GENERATE] Content preview: {content[:100] if content else 'EMPTY!'}")
        
        # Update section
        section.content = content
        db.commit()
        
        print(f"[GENERATE] Saved content for section {section.id}")
        
        results.append(ContentResponse(section_id=section.id, content=content))
        
        # Add to context for next section
        context += f"\n{section.title}: {content[:200]}..."
    
    return results


@router.post("/refine", response_model=ContentResponse)
async def refine_content(
    request: RefineContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refine content for a specific section"""
    # Get section
    section = db.query(DocumentSection).join(Project).filter(
        DocumentSection.id == request.section_id,
        Project.user_id == current_user.id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Store previous content
    previous_content = section.content or ""
    
    # Refine content
    new_content = await llm_service.refine_content(
        current_content=previous_content,
        refinement_prompt=request.prompt,
        section_title=section.title,
        doc_type=section.project.doc_type.value
    )
    
    # Update section
    section.content = new_content
    
    # Save refinement history
    refinement = RefinementHistory(
        section_id=section.id,
        prompt=request.prompt,
        previous_content=previous_content,
        new_content=new_content
    )
    db.add(refinement)
    db.commit()
    
    return ContentResponse(section_id=section.id, content=new_content)


@router.post("/feedback")
async def add_feedback(
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add feedback (like/dislike/comment) to a section"""
    # Get section
    section = db.query(DocumentSection).join(Project).filter(
        DocumentSection.id == request.section_id,
        Project.user_id == current_user.id
    ).first()
    
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    # Create feedback entry in refinement history
    feedback_entry = RefinementHistory(
        section_id=section.id,
        feedback=request.feedback,
        comment=request.comment,
        previous_content=section.content,
        new_content=section.content
    )
    db.add(feedback_entry)
    db.commit()
    
    return {"message": "Feedback recorded"}

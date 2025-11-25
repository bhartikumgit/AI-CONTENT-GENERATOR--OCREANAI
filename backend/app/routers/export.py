from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project
from app.auth import get_current_user
from app.services.docx_service import docx_service
from app.services.pptx_service import pptx_service

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/{project_id}")
async def export_document(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export project as .docx or .pptx file"""
    # Get project
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get sections ordered
    sections = sorted(project.sections, key=lambda s: s.order_index)
    sections_data = [
        {
            "title": s.title,
            "content": s.content or ""
        }
        for s in sections
    ]
    
    # Generate file based on type
    if project.doc_type.value == "docx":
        file_stream = docx_service.generate_document(
            title=project.title,
            sections=sections_data
        )
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"{project.title}.docx"
    else:  # pptx
        file_stream = pptx_service.generate_presentation(
            title=project.title,
            slides=sections_data
        )
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        filename = f"{project.title}.pptx"
    
    return StreamingResponse(
        file_stream,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

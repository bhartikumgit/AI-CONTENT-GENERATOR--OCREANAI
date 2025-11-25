import os
import google.generativeai as genai
from typing import List, Dict

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class LLMService:
    """Service for interacting with Gemini LLM"""
    
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        else:
            print("Warning: GEMINI_API_KEY not found in environment variables")
            
        # Use the available model from the user's list
        self.model = genai.GenerativeModel('models/gemini-2.0-flash')
    
    async def generate_outline(self, topic: str, doc_type: str, num_items: int = 5) -> List[str]:
        """
        Generate an outline for a document based on topic
        
        Args:
            topic: Main topic/prompt
            doc_type: Either 'docx' or 'pptx'
            num_items: Number of sections/slides to generate
            
        Returns:
            List of section titles or slide headings
        """
        if doc_type == "docx":
            prompt = f"""Generate {num_items} section headings for a professional Word document about: {topic}

Return ONLY the section headings, one per line, without numbering or additional text.
Make them clear, professional, and comprehensive."""
        else:  # pptx
            prompt = f"""Generate {num_items} slide titles for a professional PowerPoint presentation about: {topic}

Return ONLY the slide titles, one per line, without numbering or additional text.
Make them clear, engaging, and suitable for a presentation."""
        
        try:
            response = self.model.generate_content(prompt)
            lines = response.text.strip().split('\n')
            # Clean up the lines
            headings = [line.strip('- ').strip() for line in lines if line.strip()]
            return headings[:num_items]
        except Exception as e:
            print(f"Error generating outline: {e}")
            # Return default outline
            if doc_type == "docx":
                return [f"Section {i+1}" for i in range(num_items)]
            else:
                return [f"Slide {i+1}" for i in range(num_items)]
    
    async def generate_content(self, topic: str, section_title: str, doc_type: str, 
                               context: str = "") -> str:
        """
        Generate content for a specific section or slide
        
        Args:
            topic: Main document topic
            section_title: Title of the section/slide
            doc_type: Either 'docx' or 'pptx'
            context: Optional context from previous sections
            
        Returns:
            Generated content as string
        """
        if doc_type == "docx":
            prompt = f"""Topic: {topic}
Section: {section_title}

Write detailed, professional content for this section of a Word document.
{f"Context from previous sections: {context}" if context else ""}

Provide well-structured paragraphs (200-300 words) that are informative and engaging."""
        else:  # pptx
            prompt = f"""Topic: {topic}
Slide Title: {section_title}

Create concise, impactful bullet points for this PowerPoint slide.
{f"Context from previous slides: {context}" if context else ""}

Provide 4-6 clear bullet points that effectively communicate key information."""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating content: {e}")
            return f"Content for {section_title} will be generated here."
    
    async def refine_content(self, current_content: str, refinement_prompt: str, 
                            section_title: str, doc_type: str) -> str:
        """
        Refine existing content based on user feedback
        
        Args:
            current_content: Existing content to refine
            refinement_prompt: User's instruction (e.g., "make it shorter", "more formal")
            section_title: Title of the section/slide
            doc_type: Either 'docx' or 'pptx'
            
        Returns:
            Refined content as string
        """
        doc_format = "paragraphs" if doc_type == "docx" else "bullet points"
        
        prompt = f"""Current content for "{section_title}":
{current_content}

User wants: {refinement_prompt}

Rewrite the content following the user's instruction while maintaining professional quality.
Keep the format as {doc_format}. Return ONLY the revised content."""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error refining content: {e}")
            return current_content  # Return original if refinement fails


# Singleton instance
llm_service = LLMService()

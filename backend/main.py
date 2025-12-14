from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from config.firebase_config import db
from services.gemini_service import analyze_complaint
import os

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Complaint(BaseModel):
    description: str
    user_id: str = "anonymous"
    user_email: str = "anonymous"
    user_name: str = "Anonymous Student"

@app.get("/")
def read_root():
    return {"message": "CampusPulse AI Backend is running"}

@app.post("/api/complaints")
async def submit_complaint(complaint: Complaint):
    try:
        # 1. Analyze with Gemini
        analysis = analyze_complaint(complaint.description)
        
        # 2. Construct Data Object
        doc_data = {
            "complaint_text": complaint.description,
            "user_id": complaint.user_id,
            "user_email": complaint.user_email,
            "user_name": complaint.user_name,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "status": "Open",
            **analysis  # Spread analysis results (category, urgency, sentiment, summary, suggested_action)
        }
        
        # 3. Save to Firestore
        update_time, doc_ref = db.collection("complaints").add(doc_data)
        
        return {"id": doc_ref.id, "message": "Complaint processed successfully", "analysis": analysis}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/complaints")
async def get_complaints():
    try:
        complaints_ref = db.collection("complaints").order_by("created_at", direction=firebas_admin.firestore.Query.DESCENDING)
        docs = complaints_ref.stream()
        res = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            res.append(data)
        return res
    except Exception as e:
        # Fallback if index not created or other error (listing without index)
        try:
             docs = db.collection("complaints").stream()
             res = []
             for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                res.append(data)
             return res
        except Exception as e2:
             raise HTTPException(status_code=500, detail=str(e2))

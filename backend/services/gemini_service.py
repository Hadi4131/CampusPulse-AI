import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('models/gemini-2.5-flash')

def analyze_complaint(text):
    # ... (prompt remains same)
    prompt = f"""
    You are an intelligent complaint analysis system for a university campus.
    Analyze the following complaint text and extract structured data.
    
    Complaint: "{text}"
    
    Return a JSON object with the following fields:
    - category: (String) One of [WiFi, Water, Cleanliness, Infrastructure, Safety, Academic, Other]
    - urgency: (String) One of [High, Medium, Low]
    - sentiment: (String) One of [Positive, Neutral, Negative]
    - summary: (String) A concise summary of the issue (max 10 words).
    - suggested_action: (String) A recommended action for the admin.
    
    Ensure the output is valid JSON suitable for parsing. Do not include markdown code blocks.
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean up response if it contains markdown
        response_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(response_text)
        return data
    except Exception as e:
        print(f"Error analyzing complaint: {e}")
        import traceback
        traceback.print_exc()

        return {
            "category": "Uncategorized",
            "urgency": "Medium",
            "sentiment": "Neutral",
            "summary": "Analysis failed",
            "suggested_action": "Manual review required"
        }

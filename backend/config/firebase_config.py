import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as google_firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Check if app is already initialized
if not firebase_admin._apps:
    # Path to service account key
    cred_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Connect to named database 'sayed'
try:
    app = firebase_admin.get_app()
    # Extract credentials to pass to google.cloud.firestore.Client
    # Note: cred.get_credential() returns the underlying google.auth.credentials.Credentials
    g_cred = app.credential.get_credential()
    project_id = app.project_id
    
    print(f"Connecting to Firestore database: 'sayed' in project {project_id}")
    db = google_firestore.Client(project=project_id, credentials=g_cred, database='sayed')
except Exception as e:
    print(f"Error connecting to named database 'sayed': {e}")
    print("Falling back to default database...")
    db = firestore.client()

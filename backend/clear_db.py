import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as google_firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize App
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Connect to 'sayed' database
app = firebase_admin.get_app()
g_cred = app.credential.get_credential()
project_id = app.project_id
db = google_firestore.Client(project=project_id, credentials=g_cred, database='sayed')

def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f'Deleting doc {doc.id} => {doc.to_dict()}')
        doc.reference.delete()
        deleted = deleted + 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

print("Clearing 'complaints' collection...")
delete_collection(db.collection('complaints'), 10)
print("Done.")

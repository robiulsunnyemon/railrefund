from firebase_admin import firestore

# Initialize Firestore
# Note: firebase_admin is initialized in core.security, so this must be imported after it,
# or we just rely on firebase_admin being initialized before firestore.client() is called.
def get_db():
    return firestore.client()

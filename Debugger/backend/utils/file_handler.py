import os
from datetime import datetime

WORKSPACE_DIR = "workspace"

def save_uploaded_file(file_obj, filename: str):
    """
    Saves the uploaded file into workspace with a timestamp prefix.
    """
    # Create workspace if not exists
    os.makedirs(WORKSPACE_DIR, exist_ok=True)

    # Unique filename to avoid collisions
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_name = f"{timestamp}_{filename}"

    file_path = os.path.join(WORKSPACE_DIR, saved_name)

    with open(file_path, "wb") as f:
        f.write(file_obj)

    return file_path



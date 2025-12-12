from fastapi import FastAPI, UploadFile, File, HTTPException
from utils.file_handler import save_uploaded_file
from utils.preprocess import preprocess_code


app = FastAPI()

@app.post("/upload")
async def upload_python_file(file: UploadFile = File(...)):
    # 1. Allow only Python files
    if not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="Only .py files are allowed")

    # 2. Read file bytes
    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # 3. Save the file
    saved_path = save_uploaded_file(file_bytes, file.filename)


# Step 2: Preprocess the code
    preprocessed_path = preprocess_code(saved_path)


    return {
        "status": "success",
        "message": "File uploaded and saved successfully",
        "saved_path": saved_path,
        "preprocessed_path": preprocessed_path
    }

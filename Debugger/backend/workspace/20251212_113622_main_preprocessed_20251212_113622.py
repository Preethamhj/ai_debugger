from fastapi import FastAPI, UploadFile, File, HTTPException
from utils.file_handler import save_uploaded_file
from utils.preprocess import preprocess_code
from utils.ast_generator import generate_and_save_ast
app = FastAPI()
@app.get("/")
def root():
    return {"message": "Backend is running!"}
@app.post("/upload")
async def upload_python_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="Only .py files are allowed")
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    saved_path = save_uploaded_file(file_bytes, file.filename)
    preprocessed_path = preprocess_code(saved_path)
    success, ast_info = generate_and_save_ast(preprocessed_path)
    if not success:
        return {
            "status": "error",
            "message": "AST generation failed",
            "details": ast_info
        }
    return {
        "status": "success",
        "message": "File uploaded and processed",
        "saved_path": saved_path,
        "preprocessed_path": preprocessed_path,
        "ast_json": ast_info.get("ast_json"),
        "ast_dump": ast_info.get("ast_dump")
    }
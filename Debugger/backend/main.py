# from fastapi import FastAPI, UploadFile, File, HTTPException
# from utils.file_handler import save_uploaded_file
# from utils.preprocess import preprocess_code
# from utils.ast_generator import generate_and_save_ast

# app = FastAPI()

# @app.get("/")
# def root():
#     return {"message": "Backend is running!"}

# @app.post("/upload")
# async def upload_python_file(file: UploadFile = File(...)):
#     if not file.filename.endswith(".py"):
#         raise HTTPException(status_code=400, detail="Only .py files are allowed")

#     file_bytes = await file.read()

#     if len(file_bytes) == 0:
#         raise HTTPException(status_code=400, detail="Uploaded file is empty")

#     saved_path = save_uploaded_file(file_bytes, file.filename)

#     preprocessed_path = preprocess_code(saved_path)

#     success, ast_info = generate_and_save_ast(preprocessed_path)

#     if not success:
#         return {
#             "status": "error",
#             "message": "AST generation failed",
#             "details": ast_info
#         }

#     return {
#         "status": "success",
#         "message": "File uploaded and processed",
#         "saved_path": saved_path,
#         "preprocessed_path": preprocessed_path,
#         "ast_json": ast_info.get("ast_json"),
#         "ast_dump": ast_info.get("ast_dump")
#     }



# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# import os
# from datetime import datetime
# from utils.preprocess import preprocess_code
# from utils.ast_generator import generate_and_save_ast

# app = FastAPI()

# WORKSPACE_DIR = "workspace"
# os.makedirs(WORKSPACE_DIR, exist_ok=True)

# # --- Request Model ---
# class CodeInput(BaseModel):
#     code: str


# @app.post("/upload-code")
# async def upload_code(input_data: CodeInput):

#     if not input_data.code.strip():
#         raise HTTPException(status_code=400, detail="Code cannot be empty")

#     # 1. Create new file name
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     file_path = os.path.join(WORKSPACE_DIR, f"{timestamp}_input.py")

#     # 2. Save raw code into file
#     with open(file_path, "w", encoding="utf-8") as f:
#         f.write(input_data.code)

#     # 3. Preprocess the file (remove comments, normalize)
#     preprocessed_path = preprocess_code(file_path)

#     # 4. Generate AST
#     success, ast_info = generate_and_save_ast(preprocessed_path)

#     if not success:
#         return {
#             "status": "error",
#             "message": "AST generation failed",
#             "details": ast_info
#         }

#     return {
#         "status": "success",
#         "message": "Code processed successfully",
#         "saved_path": file_path,
#         "preprocessed_path": preprocessed_path,
#         "ast_json": ast_info.get("ast_json"),
#         "ast_dump": ast_info.get("ast_dump")
#     }



from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
from datetime import datetime
from utils.preprocess import preprocess_code
from utils.ast_generator import generate_and_save_ast

app = FastAPI()

WORKSPACE_DIR = "workspace"
os.makedirs(WORKSPACE_DIR, exist_ok=True)

origins = [
    "http://localhost:5174",   # React dev server
    "http://127.0.0.1:3000",
    # add other origins if needed
]
class CodeInput(BaseModel):
    code: str
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # use ["*"] only during quick local dev if you prefer
    allow_credentials=True,
    allow_methods=["*"],       # allow OPTIONS, GET, POST, etc.
    allow_headers=["*"],       # allow Content-Type, Authorization, etc.
)

@app.post("/process_code")
async def process_code(input_data: CodeInput):
    print(f"Received code for processing: {input_data.code[:50] if input_data.code else 'empty'}..." )
    if not input_data.code or not input_data.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    # 1. Create timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(WORKSPACE_DIR, f"{timestamp}_input.py")

    # 2. Save the raw user code into file
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(input_data.code)

    # 3. Execute the Python file BEFORE preprocessing
    process = subprocess.Popen(
        ["python", file_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate()

    # 4. Preprocess the code (remove comments / normalize)
    preprocessed_path = preprocess_code(file_path)

    # 5. Generate AST
    success, ast_info = generate_and_save_ast(preprocessed_path)

    if not success:
        return {
            "status": "error",
            "message": "AST generation failed",
            "details": ast_info
        }

    # 6. Final JSON response with interpreter output + AST
    return {
        "status": "success",
        "saved_file": file_path,
        "python_output": {
            "stdout": stdout,
            "stderr": stderr,
            "return_code": process.returncode
        },
        "preprocessed_file": preprocessed_path,
        "ast_json": ast_info.get("ast_json"),
        "ast_dump": ast_info.get("ast_dump")
    }

import ast
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Tuple

AST_OUTPUT_DIR = "workspace"  # same workspace used earlier


def _node_to_dict(node: ast.AST) -> Dict[str, Any]:
    """
    Convert a single AST node to a JSON-serializable dict containing:
    - node_type: e.g., FunctionDef, Assign
    - lineno, col_offset (if present)
    - end_lineno, end_col_offset (if present, Python 3.8+)
    - relevant names/values for some kinds of nodes (id, name, arg names, value repr)
    """
    node_dict: Dict[str, Any] = {"node_type": node.__class__.__name__}

    # location info (if available)
    if hasattr(node, "lineno"):
        node_dict["lineno"] = node.lineno
    if hasattr(node, "col_offset"):
        node_dict["col_offset"] = node.col_offset
    if hasattr(node, "end_lineno"):
        node_dict["end_lineno"] = node.end_lineno
    if hasattr(node, "end_col_offset"):
        node_dict["end_col_offset"] = node.end_col_offset

    # capture some node-specific info that is useful for rules
    if isinstance(node, ast.FunctionDef):
        node_dict["name"] = node.name
        node_dict["args"] = [arg.arg for arg in node.args.args]
    elif isinstance(node, ast.ClassDef):
        node_dict["name"] = node.name
        node_dict["bases"] = [ast.unparse(b) if hasattr(ast, "unparse") else ast.dump(b) for b in node.bases]
    elif isinstance(node, ast.Assign):
        # targets could be a list; make compact repr
        targets = []
        for t in node.targets:
            try:
                targets.append(ast.unparse(t))
            except Exception:
                targets.append(type(t).__name__)
        node_dict["targets"] = targets
    elif isinstance(node, ast.Name):
        node_dict["id"] = node.id
    elif isinstance(node, ast.Call):
        try:
            node_dict["func"] = ast.unparse(node.func)
        except Exception:
            node_dict["func"] = type(node.func).__name__
    elif isinstance(node, ast.Import):
        node_dict["names"] = [n.name for n in node.names]
    elif isinstance(node, ast.ImportFrom):
        node_dict["module"] = node.module
        node_dict["names"] = [n.name for n in node.names]
    elif isinstance(node, ast.Return):
        # keep a short repr of the returned value (if small)
        if node.value is not None:
            try:
                node_dict["value"] = ast.unparse(node.value)
            except Exception:
                node_dict["value"] = type(node.value).__name__

    return node_dict


def generate_ast_node_list(source_code: str) -> List[Dict[str, Any]]:
    """
    Parse source code into an AST and produce a flat list of node dicts
    (a shallow traversal using ast.walk). This list is suitable for rule-based checks.
    """
    tree = ast.parse(source_code)
    node_list: List[Dict[str, Any]] = []

    for node in ast.walk(tree):
        # ignore trivial nodes like Load/Store/Del contexts
        if isinstance(node, (ast.Load, ast.Store, ast.Del, ast.Expr)):
            continue
        try:
            node_list.append(_node_to_dict(node))
        except Exception:
            # fallback minimal info
            node_list.append({"node_type": node.__class__.__name__})
    return node_list


def generate_and_save_ast(file_path: str) -> Tuple[bool, Dict[str, str]]:
    """
    Read a Python file, parse it to an AST and save:
      - a JSON file with node metadata (file_preprocessed_ast.json)
      - a text file with ast.dump() for easier debugging (file_preprocessed_ast.txt)
    Returns (success_flag, info_dict). If parsing fails due to SyntaxError,
    success_flag = False and info_dict contains the error message.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            src = f.read()
    except Exception as e:
        return False, {"error": f"Failed to read file: {e}"}

    try:
        # Parse to AST; will raise SyntaxError if invalid
        tree = ast.parse(src)
    except SyntaxError as se:
        # Return structured syntax error info so UI/backend can present it
        return False, {
            "error": "SyntaxError",
            "message": str(se),
            "lineno": getattr(se, "lineno", None),
            "offset": getattr(se, "offset", None),
        }
    except Exception as e:
        return False, {"error": f"AST parse failed: {e}"}

    # Prepare filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.basename(file_path).replace(".py", "")
    json_fname = f"{base_name}_ast_{timestamp}.json"
    dump_fname = f"{base_name}_astdump_{timestamp}.txt"

    json_path = os.path.join(AST_OUTPUT_DIR, json_fname)
    dump_path = os.path.join(AST_OUTPUT_DIR, dump_fname)

    # Create serializable node list for rules engine
    try:
        node_list = generate_ast_node_list(src)
        with open(json_path, "w", encoding="utf-8") as jf:
            json.dump(node_list, jf, indent=2)
    except Exception as e:
        return False, {"error": f"Failed to generate/save AST JSON: {e}"}

    # Save ast.dump text (useful for debugging)
    try:
        with open(dump_path, "w", encoding="utf-8") as df:
            df.write(ast.dump(tree, include_attributes=True, indent=2 if hasattr(ast, "dump") else None))
    except Exception:
        # If ast.dump() kwargs not available, fallback to plain dump
        with open(dump_path, "w", encoding="utf-8") as df:
            df.write(ast.dump(tree))

    return True, {"ast_json": json_path, "ast_dump": dump_path}

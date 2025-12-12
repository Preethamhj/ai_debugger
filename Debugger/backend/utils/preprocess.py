import os
from datetime import datetime

def preprocess_code(file_path: str):
    """
    Preprocess Python: remove comments (carefully), normalize indentation,
    keep valid structure for AST.
    """

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    cleaned_lines = []

    for line in lines:
        original = line.rstrip("\n")

        # If the entire line is a comment -> skip
        stripped = original.lstrip()
        if stripped.startswith("#"):
            continue

        # Normalize indentation (convert tabs to 4 spaces)
        normalized = original.replace("\t", "    ")

        # Remove inline comment safely (not inside strings)
        new_line = ""
        inside_single = False
        inside_double = False

        i = 0
        while i < len(normalized):
            ch = normalized[i]

            # Track string boundaries
            if ch == "'" and not inside_double:
                inside_single = not inside_single
            elif ch == '"' and not inside_single:
                inside_double = not inside_double

            # If we hit # outside of strings → comment begins
            if ch == "#" and not inside_single and not inside_double:
                break

            new_line += ch
            i += 1

        # Remove trailing spaces
        new_line = new_line.rstrip()

        # Skip empty lines
        if new_line.strip() == "":
            continue

        cleaned_lines.append(new_line)

    # Save preprocessed file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = file_path.replace(".py", f"_preprocessed_{timestamp}.py")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(cleaned_lines))

    return out_path

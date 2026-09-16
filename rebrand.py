import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replacements for gemini.ts prompt text and other texts
    # We want to replace "Astra Infinity" with "NEXORA"
    # "Astra" with "NEXORA"
    # "ASTRA" with "NEXORA" (but avoid ASTRA_PERFORMANCE)
    
    # Specific replacements first
    content = content.replace("Astra Infinity", "NEXORA")
    content = content.replace("ASTRA INFINITY", "NEXORA")
    
    # Carefully replace Astra and astra in strings/texts
    content = re.sub(r'\bAstra\b', 'NEXORA', content)
    content = re.sub(r'\bastra\b', 'nexora', content) # for urls or storage keys
    
    # For ASTRA, replace only where it doesn't have an underscore after it (like ASTRA_PERFORMANCE)
    content = re.sub(r'\bASTRA\b(?!_)', 'NEXORA', content)

    # Some specific fixes
    content = content.replace("nexora_chat_session", "nexora_chat_session") # storage key change is fine as we are resetting or it's a new brand

    with open(filepath, 'w') as f:
        f.write(content)

files_to_process = [
    'src/services/gemini.ts',
    'src/components/Chat.tsx',
    'src/components/ProjectGen.tsx',
    'src/components/ImageGen.tsx',
    'src/App.tsx'
]

for f in files_to_process:
    if os.path.exists(f):
        process_file(f)
        print(f"Processed {f}")

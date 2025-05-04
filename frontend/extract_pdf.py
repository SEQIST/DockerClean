import pdfplumber

def extract_pdf_structure(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        structured_data = []
        current_section = {"heading": None, "paragraphs": []}

        for page in pdf.pages:
            text_objects = page.extract_text_objects()
            for obj in text_objects:
                text = obj["text"].strip()
                # Überschriften anhand von Schriftgröße oder Fett erkennen
                if obj["size"] > 12 or "Bold" in obj.get("fontname", ""):
                    if current_section["paragraphs"]:
                        structured_data.append(current_section)
                    current_section = {"heading": text, "paragraphs": []}
                else:
                    current_section["paragraphs"].append(text)
            
            if current_section["paragraphs"]:
                structured_data.append(current_section)
    
    return structured_data
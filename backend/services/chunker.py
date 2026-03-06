# Splits large documents into overlapping chunks.
# Why overlap? So clauses that fall at chunk boundaries aren't missed.

def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 200) -> list[str]:
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)

        if end == len(words):
            break

        start += chunk_size - overlap   # step forward but keep overlap

    return chunks
"""Remove o fundo branco EXTERNO dos ursinhos (mantendo o branco interno
do rosto). Usa flood-fill a partir das 4 bordas com tolerância de cor.
Salva como PNG com alpha transparente.
"""
from PIL import Image, ImageDraw
from collections import deque
import sys, os

def remover_fundo_externo(caminho_in: str, caminho_out: str, tolerancia: int = 40):
    img = Image.open(caminho_in).convert("RGBA")
    w, h = img.size
    px = img.load()

    # Coleta cor de referência do fundo: media dos 4 cantos
    cantos = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
    bg_r = sum(c[0] for c in cantos) // 4
    bg_g = sum(c[1] for c in cantos) // 4
    bg_b = sum(c[2] for c in cantos) // 4

    def eh_fundo(p):
        return (abs(p[0] - bg_r) <= tolerancia and
                abs(p[1] - bg_g) <= tolerancia and
                abs(p[2] - bg_b) <= tolerancia)

    # BFS a partir das bordas
    visitado = [[False] * h for _ in range(w)]
    fila = deque()
    # Todas as bordas
    for x in range(w):
        for y in [0, h-1]:
            if eh_fundo(px[x, y]):
                fila.append((x, y))
                visitado[x][y] = True
    for y in range(h):
        for x in [0, w-1]:
            if eh_fundo(px[x, y]) and not visitado[x][y]:
                fila.append((x, y))
                visitado[x][y] = True

    while fila:
        x, y = fila.popleft()
        # Torna transparente
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in [(1,0),(-1,0),(0,1),(0,-1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visitado[nx][ny]:
                if eh_fundo(px[nx, ny]):
                    visitado[nx][ny] = True
                    fila.append((nx, ny))

    img.save(caminho_out, "PNG")
    print(f"[ok] {caminho_in} -> {caminho_out}")

if __name__ == "__main__":
    base = os.path.join(os.path.dirname(__file__), "..", "public")
    mapa = [
        ("ursinho-rosto.jpg", "ursinho-rosto.png"),
        ("hb-animais.jpg",    "hb-animais.png"),
        ("hb-arvore.jpg",     "hb-arvore.png"),
    ]
    for src, dst in mapa:
        s = os.path.join(base, src)
        d = os.path.join(base, dst)
        if os.path.exists(s):
            remover_fundo_externo(s, d)
        else:
            print(f"[skip] {s} nao existe")

import os
from PIL import Image

def process_logo(src_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    img = Image.open(src_path).convert('RGB')
    w, h = img.size

    # 1. Bounding box for emblem
    # Emblem rows roughly 160 to 308, cols 215 to 425
    emblem_box = (215, 160, 425, 310)
    crop = img.crop(emblem_box)
    cw, ch = crop.size

    rgba = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    SOLID_LUM = 95.0
    BLACK_THRESH = 3.0

    for y in range(ch):
        for x in range(cw):
            r, g, b = crop.getpixel((x, y))
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum <= BLACK_THRESH:
                rgba.putpixel((x, y), (0, 0, 0, 0))
            elif lum >= SOLID_LUM:
                rgba.putpixel((x, y), (r, g, b, 255))
            else:
                alpha = (lum - BLACK_THRESH) / (SOLID_LUM - BLACK_THRESH)
                # smoothstep for organic antialiasing
                alpha = alpha * alpha * (3.0 - 2.0 * alpha)
                # Un-premultiply so no dark fringe on light backgrounds
                unpre_r = min(255, int(round(r / alpha)))
                unpre_g = min(255, int(round(g / alpha)))
                unpre_b = min(255, int(round(b / alpha)))
                rgba.putpixel((x, y), (unpre_r, unpre_g, unpre_b, int(round(alpha * 255))))

    # 2. Get exact tight bounding box of visible content
    tight_bbox = rgba.getbbox()
    tight_emblem = rgba.crop(tight_bbox)
    ew, eh = tight_emblem.size
    print(f'Tight emblem size: {ew}x{eh}')

    # Save tight emblem
    tight_emblem.save(os.path.join(output_dir, 'logo-emblem.png'))

    # 3. Create high-resolution master square (512x512) with pleasant padding
    def create_padded_square(size: int, padding_ratio: float = 0.12) -> Image.Image:
        target = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        max_dim = int(size * (1 - padding_ratio * 2))
        
        # Scale emblem keeping aspect ratio
        scale = min(max_dim / ew, max_dim / eh)
        new_w = int(round(ew * scale))
        new_h = int(round(eh * scale))
        
        scaled = tight_emblem.resize((new_w, new_h), Image.Resampling.LANCZOS)
        offset_x = (size - new_w) // 2
        offset_y = (size - new_h) // 2
        
        target.paste(scaled, (offset_x, offset_y), scaled)
        return target

    # 4. Generate all required logo variants
    logo_512 = create_padded_square(512, padding_ratio=0.10)
    logo_512.save(os.path.join(output_dir, 'logo.png'), optimize=True)
    logo_512.save(os.path.join(output_dir, 'pwa-512x512.png'), optimize=True)

    logo_256 = create_padded_square(256, padding_ratio=0.10)
    logo_256.save(os.path.join(output_dir, 'simple-logo.png'), optimize=True)

    logo_192 = create_padded_square(192, padding_ratio=0.10)
    logo_192.save(os.path.join(output_dir, 'pwa-192x192.png'), optimize=True)

    logo_180 = create_padded_square(180, padding_ratio=0.10)
    logo_180.save(os.path.join(output_dir, 'apple-touch-icon-180x180.png'), optimize=True)

    logo_64 = create_padded_square(64, padding_ratio=0.06)
    logo_64.save(os.path.join(output_dir, 'favicon.png'), optimize=True)

    # Also save in public/favicon.ico (multi-size ico)
    logo_32 = create_padded_square(32, padding_ratio=0.04)
    logo_32.save(os.path.join(output_dir, 'favicon-32.png'), optimize=True)

    print('Successfully generated all logo assets!')

if __name__ == '__main__':
    src = '/home/ameen/.gemini/antigravity/brain/f45191d0-f0c4-4357-bf50-62d5a5908edf/.user_uploaded/media_1792194475741.jpg'
    out = '/home/ameen/ameen/projects/AEROENIX/AEROENIX_FRONTEND/public'
    process_logo(src, out)

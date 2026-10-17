import os
from PIL import Image

def remove_black_background(crop_img: Image.Image) -> Image.Image:
    cw, ch = crop_img.size
    rgba = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    SOLID_LUM = 95.0
    BLACK_THRESH = 3.0

    for y in range(ch):
        for x in range(cw):
            r, g, b = crop_img.getpixel((x, y))
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

    return rgba

def process_logo(src_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    img = Image.open(src_path).convert('RGB')
    w, h = img.size

    # 1. Emblem only
    emblem_box = (215, 160, 425, 310)
    crop_emblem = img.crop(emblem_box)
    emblem_rgba = remove_black_background(crop_emblem)
    tight_bbox = emblem_rgba.getbbox()
    tight_emblem = emblem_rgba.crop(tight_bbox)
    ew, eh = tight_emblem.size
    tight_emblem.save(os.path.join(output_dir, 'logo-emblem.png'))
    print(f'Saved logo-emblem.png: {ew}x{eh}')

    # 2. Vertical full branding (Emblem + AZUL + HOSPITALITY, like the original)
    full_box = (175, 160, 455, 425)
    crop_full = img.crop(full_box)
    full_rgba = remove_black_background(crop_full)
    full_tight = full_rgba.crop(full_rgba.getbbox())
    full_tight.save(os.path.join(output_dir, 'logo-sidebar.png'), optimize=True)
    full_tight.save(os.path.join(output_dir, 'logo-vertical.png'), optimize=True)
    full_tight.save(os.path.join(output_dir, 'full-logo.png'), optimize=True)
    print(f'Saved logo-sidebar.png / logo-vertical.png: {full_tight.size}')

    # 3. Emblem + AZUL text (without hospitality)
    azul_box = (175, 160, 455, 395)
    crop_azul = img.crop(azul_box)
    azul_rgba = remove_black_background(crop_azul)
    azul_tight = azul_rgba.crop(azul_rgba.getbbox())
    azul_tight.save(os.path.join(output_dir, 'logo-azul.png'), optimize=True)
    print(f'Saved logo-azul.png: {azul_tight.size}')

    # 4. Master square (512x512) and PWA icons
    def create_padded_square(base_img: Image.Image, size: int, padding_ratio: float = 0.10) -> Image.Image:
        bw, bh = base_img.size
        target = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        max_dim = int(size * (1 - padding_ratio * 2))
        scale = min(max_dim / bw, max_dim / bh)
        new_w = int(round(bw * scale))
        new_h = int(round(bh * scale))
        scaled = base_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        offset_x = (size - new_w) // 2
        offset_y = (size - new_h) // 2
        target.paste(scaled, (offset_x, offset_y), scaled)
        return target

    logo_512 = create_padded_square(full_tight, 512, padding_ratio=0.08)
    logo_512.save(os.path.join(output_dir, 'logo.png'), optimize=True)
    logo_512.save(os.path.join(output_dir, 'pwa-512x512.png'), optimize=True)

    logo_256 = create_padded_square(full_tight, 256, padding_ratio=0.08)
    logo_256.save(os.path.join(output_dir, 'simple-logo.png'), optimize=True)

    logo_192 = create_padded_square(full_tight, 192, padding_ratio=0.08)
    logo_192.save(os.path.join(output_dir, 'pwa-192x192.png'), optimize=True)

    logo_180 = create_padded_square(full_tight, 180, padding_ratio=0.08)
    logo_180.save(os.path.join(output_dir, 'apple-touch-icon-180x180.png'), optimize=True)

    # Favicon: using the crisp emblem mark for small sizes
    favicon_64 = create_padded_square(tight_emblem, 64, padding_ratio=0.04)
    favicon_64.save(os.path.join(output_dir, 'favicon.png'), optimize=True)

    favicon_32 = create_padded_square(tight_emblem, 32, padding_ratio=0.02)
    favicon_32.save(os.path.join(output_dir, 'favicon-32.png'), optimize=True)

    print('Successfully generated all logo assets!')

if __name__ == '__main__':
    src = '/home/ameen/.gemini/antigravity/brain/f45191d0-f0c4-4357-bf50-62d5a5908edf/.user_uploaded/media_1792194475741.jpg'
    out = '/home/ameen/ameen/projects/AEROENIX/AEROENIX_FRONTEND/public'
    process_logo(src, out)

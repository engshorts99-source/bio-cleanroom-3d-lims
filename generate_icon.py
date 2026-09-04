import zlib
import struct
import math

def make_png(filename, width, height):
    def get_pixel(x, y):
        # Center coords (-1 to 1)
        nx = (x / width) * 2 - 1
        ny = (y / height) * 2 - 1
        dist = math.sqrt(nx * nx + ny * ny)

        # Rounded app icon squircle mask
        # (|x|^4 + |y|^4 <= 0.8^4)
        squircle = math.pow(abs(nx), 3.8) + math.pow(abs(ny), 3.8)
        if squircle > 0.8:
            return (0, 0, 0, 0)

        # Gradient background (deep slate blue to vibrant bio cyan)
        t = (ny + 1) / 2
        r = int(14 * (1 - t) + 10 * t)
        g = int(24 * (1 - t) + 165 * t)
        b = int(48 * (1 - t) + 233 * t)

        # Inner emblem: concentric centrifuge rotor circle
        cdist = math.sqrt(nx * nx + ny * ny)
        if 0.35 <= cdist <= 0.45:
            # outer ring
            return (255, 255, 255, 240)
        elif cdist <= 0.12:
            # central core
            return (56, 189, 248, 255)
        elif 0.22 <= cdist <= 0.30:
            # 6 rotor tube dots
            angle = math.atan2(ny, nx)
            angle_seg = (angle % (math.pi / 3)) - (math.pi / 6)
            if abs(angle_seg) < 0.18:
                return (248, 250, 252, 255)

        # Border outline of the squircle
        if squircle > 0.76:
            return (56, 189, 248, 200)

        return (r, g, b, 255)

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter byte: None
        for x in range(width):
            r, g, b, a = get_pixel(x, y)
            raw_data.extend([r, g, b, a])

    compressed = zlib.compress(bytes(raw_data), 9)

    def chunk(tag, data):
        length = struct.pack('>I', len(data))
        crc = struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        return length + tag + data + crc

    png = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)

make_png('/Users/pjw/.gemini/antigravity/scratch/bio-cleanroom-3d-lims/icon_512.png', 512, 512)
print("Icon PNG generated successfully!")

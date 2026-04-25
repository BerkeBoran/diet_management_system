def get_mime_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b'\xff\xd8'):
        return 'image/jpeg'
    elif image_bytes.startswith(b'\x89PNG'):
        return 'image/png'
    elif image_bytes.startswith(b'GIF8'):
        return 'image/gif'
    elif image_bytes.startswith(b'RIFF') and image_bytes[8:12] == b'WEBP':
        return 'image/webp'
    else:
        return 'image/jpeg'
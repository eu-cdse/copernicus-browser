export const IMAGE_FORMATS = [
  { text: 'JPG (no georeference)', value: 'image/jpeg', ext: 'jpg' },
  { text: 'PNG (no georeference)', value: 'image/png', ext: 'png' },
  {
    text: 'KMZ/JPG',
    value: 'application/vnd.google-earth.kmz+xml;image_type=image/jpeg',
    ext: 'kmz',
  },
  {
    text: 'KMZ/PNG',
    value: 'application/vnd.google-earth.kmz+xml;image_type=image/png',
    ext: 'kmz',
  },
  { text: 'TIFF (8-bit)', value: 'image/tiff;depth=8', ext: 'tiff' },
  { text: 'TIFF (16-bit)', value: 'image/tiff;depth=16', ext: 'tiff' },
  { text: 'TIFF (32-bit float)', value: 'image/tiff;depth=32f', ext: 'tiff' },
];

const MAX_LISTING_PHOTOS = 10;
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.72;

export function listingImages(listing) {
  const extras = Array.isArray(listing?.image_urls)
    ? listing.image_urls.filter((url) => typeof url === 'string' && url.trim())
    : [];
  const cover = typeof listing?.image_url === 'string' && listing.image_url.trim() ? listing.image_url.trim() : '';
  const merged = cover ? [cover, ...extras.filter((url) => url !== cover)] : extras;
  return [...new Set(merged)].slice(0, MAX_LISTING_PHOTOS);
}

export function compressImageFile(file, { maxEdge = MAX_EDGE, quality = JPEG_QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Please choose image files only (JPG, PNG, or WebP).'));
      return;
    }
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxEdge / img.width, maxEdge / img.height);
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not compress this image.'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const toJpeg = (q) =>
        new Promise((done) => {
          canvas.toBlob((blob) => done(blob), 'image/jpeg', q);
        });
      (async () => {
        let blob = await toJpeg(quality);
        if (blob && blob.size > 1.8 * 1024 * 1024) {
          blob = await toJpeg(0.58);
        }
        URL.revokeObjectURL(objectUrl);
        if (!blob) {
          reject(new Error('Could not compress this image.'));
          return;
        }
        resolve(new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' }));
      })().catch((err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This image could not be read.'));
    };
    img.src = objectUrl;
  });
}

export function listingCover(listing) {
  return listingImages(listing)[0] || '';
}

export async function uploadListingPhotos(supabase, userId, files) {
  if (!userId) {
    throw new Error('Please log in to upload photos.');
  }
  const selected = Array.from(files || []).slice(0, MAX_LISTING_PHOTOS);
  const urls = [];
  for (let i = 0; i < selected.length; i += 1) {
    const compressed = await compressImageFile(selected[i]);
    const path = `${userId}/${Date.now()}-${i}.jpg`;
    const { error } = await supabase.storage.from('listing-images').upload(path, compressed, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) {
      const message = String(error.message || '');
      if (/row-level security|not allowed|unauthorized/i.test(message)) {
        throw new Error('Photo upload was blocked. Please log in and try again.');
      }
      throw error;
    }
    const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
    if (data?.publicUrl) urls.push(data.publicUrl);
  }
  return urls;
}

export { MAX_LISTING_PHOTOS };

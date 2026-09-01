import { useEffect, useMemo, useRef } from 'react';
import { CircleX, ImagePlus } from 'lucide-react';
import { MAX_LISTING_PHOTOS } from '../lib/images';

const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

export default function ListingPhotoUploader({ files, onChange, disabled }) {
  const inputRef = useRef(null);
  const remaining = MAX_LISTING_PHOTOS - files.length;
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(
    () => () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    },
    [previews]
  );

  const addFiles = (list) => {
    const incoming = Array.from(list || []).filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_ORIGINAL_BYTES
    );
    if (!incoming.length) return;
    onChange([...files, ...incoming].slice(0, MAX_LISTING_PHOTOS));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        Photos (up to {MAX_LISTING_PHOTOS})
      </label>
      <p className="mb-3 text-xs text-gray-400">
        Images are compressed automatically before upload. JPG, PNG or WebP.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${index}`}
            className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
          >
            <img src={previews[index]} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(files.filter((_, i) => i !== index))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove photo"
            >
              <CircleX className="h-4 w-4" />
            </button>
            {index === 0 ? (
              <span className="absolute bottom-1 left-1 rounded bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Cover
              </span>
            ) : null}
          </div>
        ))}
        {remaining > 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-60"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[11px] font-semibold">Add</span>
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <p className="mt-2 text-xs text-gray-400">
        {files.length}/{MAX_LISTING_PHOTOS} photos selected
      </p>
    </div>
  );
}

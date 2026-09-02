import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleAlert, CircleX, ImagePlus, ShieldAlert } from 'lucide-react';
import { MAX_LISTING_PHOTOS } from '../lib/images';

const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export default function ListingPhotoUploader({ files, onChange, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [rejectionError, setRejectionError] = useState('');
  const remaining = MAX_LISTING_PHOTOS - files.length;
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(
    () => () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    },
    [previews]
  );

  const processFiles = (list) => {
    setRejectionError('');
    const rawList = Array.from(list || []);
    if (!rawList.length) return;

    // Detect non-image files like PDF, Word, Excel
    const nonImageFiles = rawList.filter(
      (file) =>
        !ALLOWED_MIMES.includes(file.type) &&
        !/\.(jpe?g|png|webp)$/i.test(file.name)
    );

    if (nonImageFiles.length > 0) {
      setRejectionError(
        'PDF, Word, and Excel files are not allowed. Please upload image files only (JPG, PNG, or WebP).'
      );
    }

    const validImages = rawList.filter(
      (file) =>
        (ALLOWED_MIMES.includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name)) &&
        file.size <= MAX_ORIGINAL_BYTES
    );

    if (!validImages.length) return;

    if (files.length + validImages.length > MAX_LISTING_PHOTOS) {
      setRejectionError(`Maximum ${MAX_LISTING_PHOTOS} pictures allowed per listing.`);
    }

    onChange([...files, ...validImages].slice(0, MAX_LISTING_PHOTOS));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Listing Photos (up to {MAX_LISTING_PHOTOS})
        </label>
        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
          {files.length}/{MAX_LISTING_PHOTOS} added
        </span>
      </div>
      <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
        Photos are auto-compressed before upload. JPG, PNG or WebP accepted. <span className="font-semibold text-rose-500">PDF, Word, Excel not allowed.</span>
      </p>

      {rejectionError && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-slide-down">
          <CircleAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{rejectionError}</span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-2 rounded-2xl transition-all ${
          dragOver
            ? 'border-2 border-dashed border-primary-500 bg-primary-50/50 dark:bg-primary-950/30'
            : 'border border-gray-100 dark:border-gray-800'
        }`}
      >
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}-${index}`}
            className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 group"
          >
            <img src={previews[index]} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setRejectionError('');
                onChange(files.filter((_, i) => i !== index));
              }}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors shadow-sm"
              aria-label="Remove photo"
            >
              <CircleX className="h-3.5 w-3.5" />
            </button>
            {index === 0 ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Cover Photo
              </span>
            ) : (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                #{index + 1}
              </span>
            )}
          </div>
        ))}
        {remaining > 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 hover:border-primary-500 hover:bg-primary-50/50 hover:text-primary-700 dark:hover:bg-primary-950/30 dark:hover:text-primary-300 disabled:opacity-60 transition-all cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
              <ImagePlus className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-bold">Add Photo</span>
            <span className="text-[9px] text-gray-400">({remaining} left)</span>
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
          processFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

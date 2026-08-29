import { useRef, useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";

export default function PhotoField({ label, error, value, onChange, existingUrl, hint }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const displayUrl = previewUrl || existingUrl;

  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>

      {displayUrl ? (
        <div className="relative">
          <img
            src={displayUrl}
            alt="Listing preview"
            width={800}
            height={300}
            className="w-full h-40 object-cover rounded-lg border border-line"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
          >
            Change photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex items-center gap-2 justify-center border border-dashed rounded-lg px-3.5 py-6 text-sm text-muted hover:border-teal/60 transition-colors ${
            error ? "border-red-400" : "border-line"
          }`}
        >
          <ImagePlus className="w-4 h-4" />
          Choose a photo (JPEG, PNG, WEBP · under 4MB)
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
        aria-label={label}
      />

      {error ? (
        <p role="alert" className="text-xs text-red-600 mt-1">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted/70 mt-1">{hint}</p>
      )}
    </div>
  );
}

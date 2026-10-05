'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

interface PhotoUploadProps {
  initialUrl?: string | null;
  onPhotoSelected: (url: string | null) => void;
}

export default function PhotoUpload({ initialUrl, onPhotoSelected }: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const handleFile = async (file: File) => {
    setError(null);

    // Validate type
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      setError('Image file size exceeds the 5MB limit. Please choose a smaller photo.');
      return;
    }

    setUploading(true);

    // Try Supabase Storage upload if live keys are present
    if (isSupabaseConfigured() && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `evidence/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaint-evidence')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('complaint-evidence')
            .getPublicUrl(filePath);

          const finalUrl = publicData.publicUrl;
          setPreviewUrl(finalUrl);
          onPhotoSelected(finalUrl);
          setUploading(false);
          return;
        }
      } catch {
        // Fallback to local data URL
      }
    }

    // Fallback: Read as Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onPhotoSelected(result);
      setUploading(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onPhotoSelected(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="aspect-video w-full max-h-64 flex items-center justify-center bg-black/5 dark:bg-black/30 overflow-hidden">
            <img
              src={previewUrl}
              alt="Complaint Photo Evidence"
              className="object-contain w-full h-full max-h-64 transition-transform group-hover:scale-102"
            />
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-white transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-md bg-red-600 text-white shadow-xs hover:bg-red-700 transition-colors"
              title="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Photo evidence attached
            </span>
            <span className="text-[11px]">Ready for submission</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${
            error
              ? 'border-red-300 dark:border-red-900/60 bg-red-50/30'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-blue-400'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            {uploading ? (
              <UploadCloud className="w-6 h-6 animate-bounce" />
            ) : (
              <ImageIcon className="w-6 h-6" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {uploading ? 'Processing evidence photo...' : 'Upload Incident Photo Evidence'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Drag & drop photo here or click to browse. Supports JPG, PNG, WEBP (Max 5MB).
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';

type FileUploadProps = {
  className?: string;
  accept?: string; // default: 'image/*'
  maxSizeMB?: number; // default: 5
  label?: string;
  hint?: string;
  onFileChange?: (file: File | null) => void;
  required?: boolean;
  disabled?: boolean;
};

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      accept = 'image/*',
      maxSizeMB = 5,
      label,
      hint,
      onFileChange,
      required,
      disabled = false,
    },
    ref
  ) => {
    const inputId = useId();
    const localInputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
      if (typeof ref === 'function') {
        ref(localInputRef.current);
      } else if (ref && 'current' in (ref as any)) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          localInputRef.current;
      }
    }, [ref]);

    useEffect(() => {
      return () => {
        if (preview) URL.revokeObjectURL(preview);
      };
    }, [preview]);

    const validateFile = (f: File) => {
      if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
        return `ไฟล์ใหญ่เกินไป (เกิน ${maxSizeMB}MB)`;
      }
      const acceptsImage =
        accept === 'image/*' ||
        accept?.split(',').some((a) => a.trim().startsWith('image/'));
      if (acceptsImage && !f.type.startsWith('image/')) {
        return 'รองรับเฉพาะไฟล์รูปภาพ';
      }
      return '';
    };

    const handleFiles = (files: FileList | null) => {
      if (!files || !files[0]) return;
      const f = files[0];
      const err = validateFile(f);
      if (err) {
        setError(err);
        setFile(null);
        setPreview(null);
        onFileChange?.(null);
        return;
      }
      setError('');
      setFile(f);
      setPreview(URL.createObjectURL(f));
      onFileChange?.(f);
    };

    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    };

    const openPicker = () => localInputRef.current?.click();

    const clearFile = () => {
      setFile(null);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (localInputRef.current) {
        localInputRef.current.value = '';
      }
      setError('');
      onFileChange?.(null);
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="mb-1.5 text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </div>
        )}

        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'group relative flex w-full flex-col items-center justify-center rounded-xl border border-dashed p-4 transition',
            dragOver
              ? 'border-primary/70 bg-primary/5'
              : 'border-muted-foreground/30 hover:border-primary/40 hover:bg-muted/40'
          )}
        >
          <input
            id={inputId}
            ref={localInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            aria-required={required}
            disabled={disabled}
          />

          {!preview ? (
            <div className="flex flex-col items-center gap-2 text-center select-none">
              <div className="rounded-full border p-3">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium">
                ลาก-วางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </div>
              {hint && (
                <div className="text-xs text-muted-foreground">{hint}</div>
              )}
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-3 select-none">
              <div className="relative w-full max-w-[320px] overflow-hidden rounded-lg border bg-white">
                <div className="aspect-square w-full">
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{file?.name}</span>
                  </div>
                  {file && (
                    <span className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </label>

        <div className="mt-3 flex items-center gap-2">
          {!preview ? (
            <Button
              type="button"
              variant="secondary"
              onClick={openPicker}
              disabled={disabled}
            >
              เลือกไฟล์
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={openPicker}
                disabled={disabled}
              >
                เปลี่ยนไฟล์
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={clearFile}
                disabled={disabled}
              >
                <X className="mr-1 h-4 w-4" />
                ลบไฟล์
              </Button>
            </>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

export default FileUpload;

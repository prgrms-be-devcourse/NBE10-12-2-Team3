"use client";

import React, { useState } from "react";

export function useThumbnail(initial: string | null = null) {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initial);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const applyFile = (file: File) => {
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) applyFile(file);
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
  };

  return {
    thumbnailPreview,
    thumbnailFile,
    isDragging,
    setIsDragging,
    fileInputRef,
    handleThumbnailChange,
    handleDrop,
    removeThumbnail,
  };
}

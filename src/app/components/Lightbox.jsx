"use client";

import { useEffect } from "react";

export default function Lightbox({ isOpen, onRequestClose, imageUrl }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onRequestClose} // Close when clicking anywhere in the background
    >
      <div 
        className="relative p-4 bg-white rounded-lg shadow-lg max-w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the lightbox
      >
        <button
          onClick={onRequestClose}
          className="absolute top-4 right-4 text-black text-3xl hover:text-red-500 transition"
        >
          &times;
        </button>
        {imageUrl.includes(".mp4") ? (
          <video src={imageUrl} controls className="max-w-full max-h-[80vh] rounded-lg shadow" />
        ) : (
          <img src={imageUrl} alt="Lightbox" className="max-w-full max-h-[80vh] rounded-lg shadow-lg" />
        )}
      </div>
    </div>
  );
}

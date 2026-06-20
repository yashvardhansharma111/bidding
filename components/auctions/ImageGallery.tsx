"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export function ImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  const prev = () => setSelected((s) => (s > 0 ? s - 1 : images.length - 1));
  const next = () => setSelected((s) => (s < images.length - 1 ? s + 1 : 0));

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative w-full h-80 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group cursor-zoom-in" onClick={() => setLightbox(true)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selected]}
                alt={`Product image ${selected + 1}`}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={18} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div className="absolute top-2 right-2 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={14} />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs rounded px-2 py-0.5">
            {selected + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === selected ? "border-[#2874F0]" : "border-gray-200 hover:border-gray-300"}`}
              >
                <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-contain p-1" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <div className="relative w-full max-w-3xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={images[selected]}
                alt="Zoomed"
                fill
                className="object-contain"
                sizes="100vw"
              />
              <button onClick={() => setLightbox(false)} className="absolute top-2 right-2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40">
                ✕
              </button>
              {images.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2 hover:bg-white/40">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// @ts-nocheck
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Announcements({ announcements }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotación cada 5 segundos
  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Resetear índice si los anuncios cambian y el índice queda fuera de rango
  useEffect(() => {
    if (currentIndex >= announcements.length) setCurrentIndex(0);
  }, [announcements]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % announcements.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);

  return (
    <div className="bg-white rounded-3xl shadow-2xl h-full flex flex-col overflow-hidden">

      {/* Header naranja */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
        <div className="flex items-center justify-center gap-3">
          <Megaphone className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            Anuncios Importantes
          </h2>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 relative overflow-hidden">
        {announcements.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <Megaphone className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 text-lg italic">
                No hay anuncios en este momento
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Slide actual */}
            <div className="h-full flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-300 shadow-lg">
                    <p className="text-slate-700 text-xl leading-relaxed text-center">
                      {announcements[currentIndex]}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controles de navegación */}
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={prev}
                  className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6 text-amber-600" />
                </button>

                <div className="flex gap-2">
                  {announcements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-8 bg-amber-500'
                          : 'w-2 bg-amber-200 hover:bg-amber-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6 text-amber-600" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

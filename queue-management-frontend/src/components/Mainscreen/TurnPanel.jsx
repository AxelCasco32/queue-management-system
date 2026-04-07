// @ts-nocheck
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function TurnPanel({ window: w }) {
  const [isNew, setIsNew] = useState(false);
  const turno = w.turnoActual || '000';

  // Dispara la animación cada vez que cambia el turno actual
  useEffect(() => {
    if (w.turnoActual) {
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [w.turnoActual]);

  const formattedNumber = String(turno).padStart(3, '0');

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative h-full"
    >
      <div className={`
        relative overflow-hidden rounded-3xl shadow-2xl h-full flex flex-col
        bg-white
        transition-all duration-500
        ${isNew ? 'ring-8 ring-yellow-400 ring-offset-4 ring-offset-cyan-600' : ''}
      `}>
        <div className="relative p-8 flex flex-col justify-center h-full">

          {/* Label Ventanilla */}
          <div className="text-center mb-4">
            <div className="inline-block bg-cyan-600 text-white px-6 py-2 rounded-full">
              <span className="text-lg font-bold uppercase tracking-wider">
                Ventanilla
              </span>
            </div>
          </div>

          {/* Número de Ventanilla */}
          <div className="text-center mb-6">
            <div className="text-[120px] font-bold text-cyan-600 leading-none">
              {w.numero}
            </div>
          </div>

          {/* Separador */}
          <div className="h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent mb-6" />

          {/* Label Turno */}
          <div className="text-center mb-2">
            <span className="text-2xl text-slate-600 font-semibold uppercase tracking-wide">
              Turno
            </span>
          </div>

          {/* Número del turno */}
          <motion.div
            className="text-center"
            animate={isNew ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.6, repeat: isNew ? 4 : 0 }}
          >
            <div className="text-[100px] font-bold text-slate-800 font-mono leading-none tracking-wider">
              {formattedNumber}
            </div>
          </motion.div>
        </div>

        {/* Badge ¡NUEVO TURNO! */}
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 right-6"
          >
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-xl">
              ¡NUEVO TURNO!
            </div>
          </motion.div>
        )}

        {/* Borde pulsante */}
        {isNew && (
          <motion.div
            className="absolute inset-0 rounded-3xl border-8 border-yellow-400"
            animate={{ opacity: [0.8, 0, 0.8], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}

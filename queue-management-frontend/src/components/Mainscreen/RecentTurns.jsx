// @ts-nocheck
import { motion, AnimatePresence } from 'motion/react';
import { History } from 'lucide-react';

export function RecentTurns({ turns }) {
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });

  // Máximo 7 turnos para que quepan sin scroll
  const displayTurns = turns.slice(0, 7);

  return (
    <div className="bg-white rounded-3xl shadow-2xl h-full flex flex-col overflow-hidden">

      {/* Header cyan */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 p-5">
        <div className="flex items-center justify-center gap-3">
          <History className="w-7 h-7 text-white" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
            Turnos Anteriores
          </h2>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 p-5 overflow-hidden">
        {displayTurns.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <History className="w-20 h-20 mx-auto mb-4 text-cyan-200" />
              <p className="text-slate-400 text-lg">Esperando turnos...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 h-full">
            <AnimatePresence mode="popLayout">
              {displayTurns.map((item, index) => (
                <motion.div
                  key={`${item.numero}-${item.ventanilla}-${index}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className={`
                    rounded-2xl p-4 border-2 transition-all
                    ${index === 0
                      ? 'bg-cyan-50 border-cyan-400 shadow-lg'
                      : 'bg-slate-50 border-slate-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    {/* Ventanilla */}
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        Ventanilla
                      </div>
                      <div className={`text-4xl font-bold ${index === 0 ? 'text-cyan-600' : 'text-slate-600'}`}>
                        {item.ventanilla}
                      </div>
                    </div>

                    {/* Número de turno */}
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        Turno
                      </div>
                      <div className={`text-4xl font-bold font-mono ${index === 0 ? 'text-cyan-700' : 'text-slate-700'}`}>
                        {String(item.numero).padStart(3, '0')}
                      </div>
                    </div>
                  </div>

                  {/* Hora — solo si viene en el objeto */}
                  {item.timestamp && (
                    <div className="flex justify-end">
                      <div className="text-xs text-slate-500">
                        {formatTime(item.timestamp)}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

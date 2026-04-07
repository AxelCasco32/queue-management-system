// @ts-nocheck
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () =>
    currentTime.toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });

  const formatDate = () =>
    currentTime.toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div className="bg-white shadow-2xl">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">

          {/* Logo y nombre del hospital */}
          <div className="flex items-center gap-6">
            <img
              src="/images/logo.png"
              alt="HIGA Luisa C. de Gandulfo"
              className="w-24 h-24 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-cyan-700 leading-tight">
                Hospital Interzonal General de Agudos
              </h1>
              <h2 className="text-3xl font-bold text-cyan-600 leading-tight">
                Luisa C. de Gandulfo
              </h2>
            </div>
          </div>

          {/* Reloj y fecha */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-3 mb-1">
              <Clock className="w-6 h-6 text-cyan-600" />
              <div className="text-5xl font-bold text-cyan-700 font-mono tabular-nums">
                {formatTime()}
              </div>
            </div>
            <div className="text-sm text-slate-600 capitalize">
              {formatDate()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
// @ts-nocheck
import { useState, useEffect } from 'react';
import { windowsAPI } from '../../services/api';
import socketService from '../../services/socket';
import { Header } from './Header';
import { TurnPanel } from './TurnPanel';
import { Announcements } from './Announcements';
import { RecentTurns } from './RecentTurns';

const MainScreen = () => {
  const [windows, setWindows] = useState([]);
  const [recentTurns, setRecentTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  // ===== CARGA INICIAL =====
  useEffect(() => {
    loadWindows();
  }, []);

  // ===== REPRODUCIR SONIDO =====
  const playSound = () => {
    const audio = new Audio('/sounds/llamada.mp3');
    audio.play().catch((err) => console.warn('Audio bloqueado:', err));
  };

  // ===== SOCKETS =====
  useEffect(() => {
    socketService.connect();
    socketService.joinScreen();

    socketService.onTurnCalled(() => {
      playSound();
      loadWindows();
    });

    socketService.onTurnReCalled(() => {
      playSound();
      loadWindows();
    });

    socketService.onAnnouncementUpdated((data) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.numero === data.ventanilla ? { ...w, anuncio: data.anuncio } : w
        )
      );
    });

    return () => {
      socketService.off('turno:llamado');
      socketService.off('turno:rellamado');
      socketService.off('anuncio:actualizado');
    };
  }, []);

  const loadWindows = async () => {
    try {
      const response = await windowsAPI.getActive();
      const data = response.data.data;
      setWindows(data);

      // Reconstruir historial de recientes a partir de ultimosLlamados
      const recent = data
        .flatMap((w) =>
          (w.ultimosLlamados || []).slice(0, 5).map((numero) => ({
            numero,
            ventanilla: w.numero,
          }))
        )
        .slice(0, 7);
      setRecentTurns(recent);
    } catch (error) {
      console.error('Error cargando ventanillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScreen = () => {
    const audio = new Audio('/sounds/llamada.mp3');
    audio.play().then(() => audio.pause()).catch(() => {});
    setStarted(true);
  };

  // ===== PANTALLA DE CARGA =====
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-700">
        <div className="text-white text-3xl font-bold tracking-widest animate-pulse">
          Cargando...
        </div>
      </div>
    );
  }

  // ===== PANTALLA DE INICIO =====
  if (!started) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-cyan-700 via-teal-600 to-cyan-800">
        <button
          onClick={startScreen}
          className="bg-white rounded-3xl px-20 py-14 flex flex-col items-center gap-5 shadow-2xl hover:scale-105 transition-transform"
        >
          <img src="/images/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
          <span className="text-cyan-700 text-3xl font-extrabold tracking-wide">
            Iniciar Pantalla
          </span>
        </button>
      </div>
    );
  }

  // ===== Anuncios: tomar de las ventanillas que tienen anuncio =====
  const announcements = windows
    .filter((w) => w.anuncio)
    .map((w) => `Ventanilla ${w.numero}: ${w.anuncio}`);

  // ===== PANTALLA PRINCIPAL =====
  return (
    <div className="h-screen bg-gradient-to-br from-cyan-600 via-teal-500 to-cyan-700 overflow-hidden flex flex-col">

      {/* Header con logo y reloj */}
      <Header />

      {/* Contenido principal */}
      <div className="flex-1 p-6 grid grid-cols-[1fr_400px] gap-6 overflow-hidden">

        {/* Columna izquierda: paneles de turno + anuncios */}
        <div className="flex flex-col gap-6 h-full">

          {/* Grid de ventanillas */}
          <div className="grid grid-cols-3 gap-6 flex-1">
            {windows.map((w) => (
              <TurnPanel key={w._id} window={w} />
            ))}
          </div>

          {/* Panel de anuncios */}
          <div className="h-[200px]">
            <Announcements announcements={announcements} />
          </div>
        </div>

        {/* Sidebar: últimos turnos */}
        <div className="h-full">
          <RecentTurns turns={recentTurns} />
        </div>
      </div>
    </div>
  );
};

export default MainScreen;

import Window from '../models/window.js';
import Queue from '../models/Queue.js';

class WindowController {

  // Devuelve todas las ventanillas registradas ordenadas por número.
  async getAll(req, res) {
    try {
      const windows = await Window.find().sort({ numero: 1 });
      res.json({ success: true, data: windows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Obtiene únicamente las ventanillas que se encuentran habilitadas.
  async getActive(req, res) {
    try {
      const windows = await Window.find({ activa: true }).sort({ numero: 1 });
      res.json({ success: true, data: windows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Busca una ventanilla específica utilizando su ID.
  async getById(req, res) {
    try {
      const window = await Window.findById(req.params.id);

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Asigna el siguiente turno disponible de la cola a la ventanilla.
  async callNext(req, res) {
    try {
      const window = await Window.findById(req.params.id);

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      // Se obtiene la cola correspondiente al día actual.
      const queue = await Queue.getTodayQueue();

      // Verifica que todavía existan turnos pendientes.
      const next = queue.getNext();

      if (!next)
        return res.status(400).json({
          success: false,
          message: 'No hay más turnos'
        });

      // Asigna el turno a la ventanilla y actualiza la cola.
      const { numero, esUltimo } = queue.assignTurn(window.numero);
      await queue.save();

      // Guarda el turno actual y mantiene un historial de los últimos cinco llamados.
      window.turnoActual = numero;
      window.ultimosLlamados.unshift(numero);
      window.ultimosLlamados = window.ultimosLlamados.slice(0, 5);

      await window.save();

      // Notifica en tiempo real el nuevo llamado.
      req.io.emit('turno:llamado', {
        ventanilla: window.numero,
        color: window.color,
        turno: numero,
        ultimosLlamados: window.ultimosLlamados
      });

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Reproduce nuevamente el turno actual sin modificar la cola.
  async reCall(req, res) {
    try {
      const window = await Window.findById(req.params.id);

      req.io.emit('turno:rellamado', {
        ventanilla: window.numero,
        turno: window.turnoActual
      });

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Actualiza el anuncio mostrado para una ventanilla.
  async updateAnnouncement(req, res) {
    try {
      const { anuncio } = req.body;

      const window = await Window.findByIdAndUpdate(
        req.params.id,
        { anuncio: anuncio || '' },
        { new: true }
      );

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      // Informa el cambio al resto de los clientes conectados.
      req.io.emit('anuncio:actualizado', {
        ventanilla: window.numero,
        anuncio: window.anuncio
      });

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Limpia el estado de la ventanilla y elimina su historial de llamados.
  async clear(req, res) {
    try {
      const window = await Window.findByIdAndUpdate(
        req.params.id,
        {
          turnoActual: '000',
          ultimosLlamados: [],
          anuncio: ''
        },
        { new: true }
      );

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Devuelve el estado completo de la cola del día.
  async queueStatus(req, res) {
    try {
      const queue = await Queue.getTodayQueue();

      res.json({
        success: true,
        data: queue
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Reinicia la cola y deja todas las ventanillas en su estado inicial.
  async resetQueue(req, res) {
    try {
      const queue = await Queue.getTodayQueue();

      await queue.reset();

      await Window.updateMany(
        {},
        {
          turnoActual: '000',
          ultimosLlamados: [],
          anuncio: ''
        }
      );

      req.io.emit('cola:reseteada', {
        mensaje: 'Cola reiniciada'
      });

      res.json({
        success: true,
        message: 'Reiniciado'
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Reinicia únicamente el contador de una ventanilla.
  async resetCounter(req, res) {
    try {
      const window = await Window.findByIdAndUpdate(
        req.params.id,
        {
          turnoActual: '000',
          ultimosLlamados: []
        },
        { new: true }
      );

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      // Actualiza el panel para reflejar el reinicio.
      req.io.emit('turno:llamado', {
        ventanilla: window.numero,
        turno: '000',
        ultimosLlamados: []
      });

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Crea una nueva ventanilla utilizando los datos recibidos.
  async create(req, res) {
    try {
      const window = new Window(req.body);

      await window.save();

      res.status(201).json({
        success: true,
        data: window
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Elimina una ventanilla del sistema.
  async delete(req, res) {
    try {
      const window = await Window.findByIdAndDelete(req.params.id);

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      req.io.emit('ventanilla:eliminada', {
        id: req.params.id,
        numero: window.numero
      });

      res.json({
        success: true,
        message: `Ventanilla ${window.numero} eliminada`
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Cambia el estado de una ventanilla entre activa e inactiva.
  async toggleActive(req, res) {
    try {
      const window = await Window.findById(req.params.id);

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      window.activa = !window.activa;

      await window.save();

      res.json({
        success: true,
        data: window
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

}

const controller = new WindowController();

// Se enlazan todos los métodos al objeto para conservar el contexto de "this"
// cuando son utilizados como callbacks en las rutas de Express.
Object.getOwnPropertyNames(WindowController.prototype)
  .filter(method => method !== 'constructor')
  .forEach(method => {
    controller[method] = controller[method].bind(controller);
  });

export default controller;
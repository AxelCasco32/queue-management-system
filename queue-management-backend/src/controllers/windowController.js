import Window from '../models/window.js';
import Queue from '../models/Queue.js';

class WindowController {

  async getAll(req, res) {
    try {
      const windows = await Window.find().sort({ numero: 1 });
      res.json({ success: true, data: windows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getActive(req, res) {
    try {
      const windows = await Window.find({ activa: true }).sort({ numero: 1 });
      res.json({ success: true, data: windows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

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

  async callNext(req, res) {
    try {
      const window = await Window.findById(req.params.id);

      if (!window)
        return res.status(404).json({
          success: false,
          message: 'No encontrada'
        });

      const queue = await Queue.getTodayQueue();
      const next = queue.getNext();

      if (!next)
        return res.status(400).json({
          success: false,
          message: 'No hay más turnos'
        });

      const { numero, esUltimo } = queue.assignTurn(window.numero);
      await queue.save();

      // solo guardo los ultimos 5, sino la lista crece para siempre
      window.turnoActual = numero;
      window.ultimosLlamados.unshift(numero);
      window.ultimosLlamados = window.ultimosLlamados.slice(0, 5);

      await window.save();

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

      req.io.emit('anuncio:actualizado', {
        ventanilla: window.numero,
        anuncio: window.anuncio
      });

      res.json({ success: true, data: window });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

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

  // este solo resetea el contador de UNA ventanilla, no toda la cola del dia
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

// bindeo todo porque sino "this" se pierde cuando Express llama estos metodos
Object.getOwnPropertyNames(WindowController.prototype)
  .filter(method => method !== 'constructor')
  .forEach(method => {
    controller[method] = controller[method].bind(controller);
  });

export default controller;

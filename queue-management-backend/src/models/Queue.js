import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true,
    unique: true
  },
  
  turnoActual: {
    type: Number,
    default: 0
  },
  
  turnosDisponibles: [{
    type: Number
  }],
  
  turnosLlamados: [{
    numero: Number,
    ventanilla: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  resetAt: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });



/**
 Este metodo obtiene la cola del dia actual, si no existe la crea del 1 al 100
 */
queueSchema.statics.getTodayQueue = async function() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let queue = await this.findOne({ fecha: hoy });
  
  if (!queue) {
    queue = await this.create({
      fecha: hoy,
      turnoActual: 0,
      turnosDisponibles: Array.from({ length: 100 }, (_, i) => i + 1),
      turnosLlamados: []
    });
    
    console.log('✅ Nueva cola creada para hoy');
  }
  
  return queue;
};


queueSchema.methods.getNext = function() {
  if (this.turnosDisponibles.length === 0) {
    return null;
  }
  return this.turnosDisponibles[0];
};


queueSchema.methods.assignTurn = function(ventanillaNumero) {
  const siguienteTurno = this.turnosDisponibles.shift();
  
  if (!siguienteTurno) {
    throw new Error('No hay más turnos disponibles');
  }
  
  const numeroFormateado = String(siguienteTurno).padStart(3, '0');
  
  this.turnosLlamados.push({
    numero: siguienteTurno,
    ventanilla: ventanillaNumero,
    timestamp: new Date()
  });
  
  this.turnoActual = siguienteTurno;
  
  if (siguienteTurno === 100) {
    console.log('🔄 Turno 100 alcanzado. Cola se reiniciará.');
    this.turnoActual = 0;
    this.turnosDisponibles = Array.from({ length: 100 }, (_, i) => i + 1);
    this.turnosLlamados = [];
    this.resetAt = new Date();
  }
  
  return { 
    numero: numeroFormateado, 
    turno: siguienteTurno, 
    esUltimo: siguienteTurno === 100 
  };
};

/**
 resetea la cola desde panel admin
 */
queueSchema.methods.reset = function() {
  this.turnoActual = 0;
  this.turnosDisponibles = Array.from({ length: 100 }, (_, i) => i + 1);
  this.turnosLlamados = [];
  this.resetAt = new Date();
  return this.save();
};

const Queue = mongoose.model('Cola', queueSchema);
export default Queue;
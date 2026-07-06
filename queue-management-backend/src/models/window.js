import mongoose from 'mongoose';

const windowSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: true,
        unique: true 
    },
    color: {
        type: String, 
        enum: ['verde', 'azul', 'rojo', 'negro'],  
        default: 'verde'
    },
    turnoActual: {  
        type: String,
        default: '000'
    },
    ultimosLlamados: [{
        type: String
    }],
    anuncio: {
        type: String,
        default: '',
        maxlength: 200
    },
    activa: {
        type: Boolean,
        default: true  
    },
    operador: { 
        type: String,
        default: ''
    }
}, { timestamps: true }); 




windowSchema.methods.assignTurn = function(numeroTurno) {
  this.turnoActual = numeroTurno; 
  
  this.ultimosLlamados.unshift(numeroTurno);
  if (this.ultimosLlamados.length > 10) {
    this.ultimosLlamados = this.ultimosLlamados.slice(0, 10);
  }
  
  return this.save();
};


windowSchema.methods.updateAnnouncement = function(texto) {
  this.anuncio = texto;
  return this.save();
};

/* este metodo limpia desde admin los datos de la ventanilla, el numero, los ultimos llamados y los anuncios
 */
windowSchema.methods.clear = function() {
  this.turnoActual = '000';  
  this.ultimosLlamados = [];
  this.anuncio = '';
  return this.save();
};

const Window = mongoose.model('Ventanilla', windowSchema);
export default Window;
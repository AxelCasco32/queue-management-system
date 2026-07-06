# Sistema de Gestión de Turnos Hospitalarios

##  Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Guía de Uso](#guía-de-uso)
7. [API Reference](#api-reference)
8. [Base de Datos](#base-de-datos)
9. [Comunicación en Tiempo Real](#comunicación-en-tiempo-real)
10. [Troubleshooting](#troubleshooting)
11. [Mantenimiento](#mantenimiento)

---

## Descripción General

Sistema de gestión de turnos en tiempo real para hospitales que permite:

- Gestión automática de cola de turnos (1-100, con reinicio automático)
- Múltiples ventanillas de atención simultáneas
- Pantalla pública para sala de espera
- Panel de operador para cada ventanilla
- Anuncios personalizados por ventanilla
- Sincronización en tiempo real vía WebSocket
- Historial de turnos llamados
- Sistema de audio para notificaciones

---

## Arquitectura del Sistema

### **Componentes Principales:**

```
┌─────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA DEL SISTEMA                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐          ┌──────────────────┐
│  Pantalla Pública│◄─────────┤  Socket.IO       │
│  (Sala Espera)   │          │  Server          │
└──────────────────┘          └────────┬─────────┘
                                       │
┌──────────────────┐                   │
│  Panel Operador  │◄──────────────────┤
│  (Ventanilla)    │                   │
└──────────────────┘                   │
                                       │
┌──────────────────┐          ┌────────▼─────────┐
│  Panel Admin     │◄─────────┤  Express API     │
└──────────────────┘          │  (REST)          │
                              └────────┬─────────┘
                                       │
                              ┌────────▼─────────┐
                              │  MongoDB         │
                              │  (Base de Datos) │
                              └──────────────────┘
```

### **Flujo de Datos:**

```
1. Operador presiona "Llamar Siguiente"
   ↓
2. Request POST → Backend API
   ↓
3. Backend actualiza MongoDB
   ↓
4. Backend emite evento Socket.IO
   ↓
5. Pantalla Pública recibe evento
   ↓
6. UI se actualiza automáticamente
   ↓
7. Sonido de notificación
```

---

## Tecnologías Utilizadas

### **Backend:**
- **Node.js** v18+ - Runtime de JavaScript
- **Express.js** v4.18 - Framework web
- **MongoDB** v7.0 - Base de datos NoSQL
- **Mongoose** v7.0 - ODM para MongoDB
- **Socket.IO** v4.6 - WebSocket para tiempo real
- **dotenv** - Gestión de variables de entorno
- **CORS** - Middleware para CORS

### **Frontend:**
- **React** v18.2 - Librería UI
- **Vite** - Build tool y dev server
- **React Router** v6 - Enrutamiento
- **Axios** - Cliente HTTP
- **Socket.IO Client** v4.6 - Cliente WebSocket
- **Tailwind CSS** v3.3 - Framework CSS
- **Lucide React** - Iconos

### **Herramientas de Desarrollo:**
- **Nodemon** - Auto-reload servidor
- **ESLint** - Linter JavaScript
- **PostCSS** - Procesador CSS

---

## Estructura del Proyecto

```
queue-management-system/
│
├── queue-management-backend/           # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/                     # Modelos de MongoDB (Mongoose)
│   │   │   ├── Window.js              # Modelo de Ventanilla
│   │   │   └── Queue.js               # Modelo de Cola
│   │   │
│   │   ├── controllers/                # Controladores (lógica de negocio)
│   │   │   └── WindowController.js    # Controller de ventanillas
│   │   │
│   │   ├── routes/                     # Rutas de la API REST
│   │   │   └── windowRoutes.js        # Rutas de ventanillas
│   │   │
│   │   └── socket/                     # Gestión de WebSocket
│   │       └── SocketManager.js       # Clase Socket.IO
│   │
│   ├── server.js                       # Punto de entrada del servidor
│   ├── seed.js                         # Script de inicialización de BD
│   ├── package.json                    # Dependencias backend
│   └── .env                           # Variables de entorno
│
└── queue-management-frontend/          # Frontend (React + Vite)
    ├── src/
    │   ├── components/                 # Componentes React
    │   │   ├── Mainscreen/            # Pantalla pública
    │   │   │   ├── Mainscreen.jsx     # Componente principal
    │   │   │   ├── TurnCard.jsx       # Tarjeta de turno
    │   │   │   └── RecentTurns.jsx    # Últimos turnos
    │   │   │
    │   │   ├── OperatorPanel/         # Panel de operador
    │   │   │   └── OperatorPanel.jsx  # Vista de ventanilla
    │   │   │
    │   │   ├── AdminPanel/            # Panel administrativo
    │   │   │   └── AdminPanel.jsx     # Vista de admin
    │   │   │
    │   │   └── Kiosk/                 # Kiosko autoservicio
    │   │       └── Kiosk.jsx          # Emisión de turnos
    │   │
    │   ├── services/                   # Servicios externos
    │   │   ├── api.js                 # Cliente Axios (HTTP)
    │   │   └── socket.js              # Cliente Socket.IO
    │   │
    │   ├── App.jsx                     # Componente raíz + Router
    │   ├── main.jsx                    # Punto de entrada React
    │   └── index.css                   # Estilos globales
    │
    ├── public/                         # Archivos estáticos
    │   ├── images/                     # Imágenes y logos
    │   │   └── logo.png
    │   └── sounds/                     # Archivos de audio
    │       └── llamada.mp3
    │
    ├── index.html                      # HTML principal
    ├── package.json                    # Dependencias frontend
    ├── vite.config.js                  # Configuración Vite
    └── tailwind.config.cjs             # Configuración Tailwind
```

---

## Instalación y Configuración

### **Prerrequisitos:**

```bash
- Node.js v18 o superior
- MongoDB v7.0 o superior
- npm v9 o superior
```

### **Paso 1: Clonar el repositorio**

```bash
git clone <repository-url>
cd queue-management-system
```

### **Paso 2: Configurar Backend**

```bash
# Navegar a la carpeta backend
cd queue-management-backend

# Instalar dependencias
npm install

# Crear archivo .env
```

**Contenido de `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/llamador_turnos
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Inicializar base de datos:**
```bash
# Ejecutar seed (crear ventanillas y cola inicial)
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará corriendo en `http://localhost:5000`

---

### **Paso 3: Configurar Frontend**

```bash
# En otra terminal, navegar a frontend
cd queue-management-frontend

# Instalar dependencias
npm install

# Crear archivo .env
```

**Contenido de `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

---

### **Paso 4: Verificar Instalación**

**Backend:**
```bash
curl http://localhost:5000/health
# Debería responder: {"status":"OK"}
```

**Frontend:**
```
Abrir: http://localhost:5173
Deberías ver la pantalla principal
```

---

## Guía de Uso

### **1. Pantalla Principal (Sala de Espera)**

**URL:** `http://localhost:5173/` o `http://localhost:5173/pantalla`

**Descripción:** Pantalla pública que muestra los turnos actuales en cada ventanilla.

**Características:**
- Muestra turnos actuales de todas las ventanillas
- Colores diferenciados por ventanilla (verde, azul, rojo)
- Sección de mensajes informativos
- Últimos 5 turnos llamados
- Anuncios personalizados por ventanilla
- Actualización automática en tiempo real
- Sonido de notificación al llamar turno

**Optimizada para:** Pantalla de 43" (1920x1080)

---

### **2. Panel de Operador (Ventanilla)**

**URL:** `http://localhost:5173/operador/:ventanillaId`

**Descripción:** Interfaz para el personal de ventanilla.

**Funcionalidades:**

#### **Llamar Siguiente Turno:**
- Click en botón "Llamar Siguiente"
- Asigna automáticamente el próximo turno de la cola (001-100)
- Emite sonido en la pantalla pública
- Actualiza el historial de turnos

#### **Re-llamar Turno:**
- Vuelve a anunciar el turno actual
- Útil si el paciente no escuchó
- No avanza en la cola

#### **Gestión de Anuncios:**
- Campo de texto para escribir mensajes
- Máximo 200 caracteres
- Se muestra en la pantalla pública
- Actualización en tiempo real

#### **Visualización:**
- Turno actual grande y visible
- Turnos en progreso de otras ventanillas
- Últimos 5 turnos llamados en esta ventanilla
- Color identificador de la ventanilla

---

### **3. Panel Administrativo**

**URL:** `http://localhost:5173/admin`

**Funcionalidades:**
- Ver todas las ventanillas
- Estadísticas del día
- Resetear la cola manualmente
- Ver estado de la cola (turnos restantes)
- Gestionar ventanillas (activar/desactivar)

---

### **4. Selector de Ventanilla**

**URL:** `http://localhost:5173/seleccionar`

**Descripción:** Pantalla de selección para que el operador elija su ventanilla.

**Muestra:**
- Todas las ventanillas disponibles
- Estado actual de cada ventanilla
- Turno actual
- Operador asignado

---

##  API Reference

### **Base URL:** `http://localhost:5000/api`

---

### **Ventanillas**

#### **GET /ventanillas**
Obtener todas las ventanillas.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6959abc...",
      "numero": 5,
      "color": "verde",
      "turnoActual": "005",
      "ultimosLlamados": ["005", "004", "003"],
      "anuncio": "Traer DNI y orden médica",
      "activa": true,
      "operador": "María González"
    }
  ]
}
```

---

#### **GET /ventanillas/activas**
Obtener solo ventanillas activas (para pantalla pública).

---

#### **GET /ventanillas/:id**
Obtener una ventanilla específica.

---

#### **POST /ventanillas/:id/llamar-siguiente**
Llamar el siguiente turno de la cola.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "turno": "006",
    "turnosRestantes": 94,
    "esUltimo": false,
    "mensaje": "Turno 006 llamado en ventanilla 5"
  }
}
```

---

#### **POST /ventanillas/:id/rellamar**
Re-llamar el turno actual.

---

#### **PATCH /ventanillas/:id/anuncio**
Actualizar anuncio de una ventanilla.

**Body:**
```json
{
  "anuncio": "Traer DNI y orden médica"
}
```

---

#### **DELETE /ventanillas/:id/limpiar**
Limpiar ventanilla (resetear turno actual y últimos llamados).

---

### **Cola**

#### **GET /ventanillas/cola/estado**
Obtener estado actual de la cola.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "turnoActual": "006",
    "turnosRestantes": 94,
    "turnosLlamados": 6,
    "proximoTurno": "007"
  }
}
```

---

#### **POST /ventanillas/cola/resetear**
Resetear la cola manualmente (volver a turno 001).

---

## Base de Datos

### **Colección: Ventanillas (windows)**

```javascript
{
  _id: ObjectId,
  numero: Number,              // 3, 5, 7
  color: String,               // "verde", "azul", "rojo", "negro"
  turnoActual: String,         // "005"
  ultimosLlamados: [String],   // ["005", "004", "003"]
  anuncio: String,             // Mensaje personalizado
  activa: Boolean,             // true/false
  operador: String,            // Nombre del operador
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `numero`: único, ascendente

---

### **Colección: Cola (queues)**

```javascript
{
  _id: ObjectId,
  fecha: Date,                 // Fecha del día (00:00:00)
  turnoActual: Number,         // Último turno llamado (0-100)
  turnosDisponibles: [Number], // [7, 8, 9, ... 100]
  turnosLlamados: [            // Historial del día
    {
      numero: Number,          // 1, 2, 3...
      ventanilla: Number,      // 5
      timestamp: Date
    }
  ],
  resetAt: Date,               // Última vez que se reseteó
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `fecha`: único

---

## Comunicación en Tiempo Real

### **Eventos Socket.IO**

#### **Cliente → Servidor:**

```javascript
// Pantalla pública se conecta
socket.emit('pantalla:conectar')

// Operador se conecta
socket.emit('operador:conectar', { ventanillaId: '6959abc...' })
```

---

#### **Servidor → Cliente:**

```javascript
// Turno llamado
socket.on('turno:llamado', (data) => {
  // data: { ventanilla, color, turno, ultimosLlamados, turnosRestantes }
})

// Turno re-llamado
socket.on('turno:rellamado', (data) => {
  // data: { ventanilla, color, turno }
})

// Anuncio actualizado
socket.on('anuncio:actualizado', (data) => {
  // data: { ventanilla, anuncio }
})

// Cola completada (llegó al turno 100)
socket.on('cola:completada', (data) => {
  // data: { mensaje }
})

// Ventanilla limpiada
socket.on('ventanilla:limpiada', (data) => {
  // data: { ventanilla }
})
```

---

## Troubleshooting

### **Backend no inicia:**

```bash
# Verificar MongoDB
mongod --version

# Verificar que MongoDB esté corriendo
# En otra terminal:
mongod

# Verificar puerto 5000 no esté en uso
netstat -ano | findstr :5000   # Windows
lsof -i :5000                  # Mac/Linux
```

---

### **Frontend no se conecta al backend:**

```bash
# Verificar variables de entorno
cat .env

# Asegurar que apunten a localhost:5000

# Verificar CORS en backend
# En server.js debe estar:
cors({ origin: process.env.CORS_ORIGIN })
```

---

### **Socket.IO no actualiza:**

```javascript
// En consola del navegador (F12)
// Buscar:
Socket conectado: xyz123
Conectado como pantalla pública

// Si no aparece, verificar:
- Backend corriendo
- Frontend .env correcto
- No hay firewall bloqueando WebSocket
```

---

### **Turnos no se llaman:**

```bash
# Verificar que la cola tenga turnos
curl http://localhost:5000/api/ventanillas/cola/estado

# Si turnosRestantes = 0, resetear:
curl -X POST http://localhost:5000/api/ventanillas/cola/resetear
```

---

## Mantenimiento

### **Reseteo Diario Automático:**

La cola se resetea automáticamente al llegar al turno 100.

**Verificar en los logs:**
```
 Turno 100 alcanzado. Cola se reiniciará.
```

---

### **Backup de Base de Datos:**

```bash
# Backup
mongodump --db llamador_turnos --out ./backup

# Restore
mongorestore --db llamador_turnos ./backup/llamador_turnos
```

---

### **Logs del Sistema:**

```bash
# Backend logs (en consola)
 MongoDB conectado
 http://localhost:5000
 Socket.IO listo
POST /api/ventanillas/.../llamar-siguiente
⚡ Turno 005 asignado a ventanilla 5
```

---

## Estadísticas y Métricas

El sistema registra:
- Cantidad de turnos llamados por día
- Turnos por ventanilla
- Tiempo promedio de atención (calculable desde timestamps)
- Historial completo de turnos

---

## Seguridad

### **Recomendaciones para Producción:**

1. **Variables de entorno:**
   - No commitear archivos `.env`
   - Usar variables de entorno seguras en producción

2. **Base de datos:**
   - Configurar autenticación en MongoDB
   - Backup automático diario

3. **HTTPS:**
   - Usar certificados SSL en producción
   - Configurar HTTPS en Nginx/Apache

4. **Rate Limiting:**
   - Limitar requests por IP
   - Proteger contra DoS

---

## Notas Adicionales

### **Límites del Sistema:**
- Turnos por día: 100 (se resetea automáticamente)
- Anuncios: máximo 200 caracteres
- Ventanillas: ilimitadas (configurables)
- Conexiones simultáneas: ilimitadas

### **Compatibilidad:**
- Navegadores: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Pantallas: optimizado para 1920x1080 (Full HD)
- Dispositivos: PC, tablets, pantallas táctiles

---

## Soporte y Contacto

Para soporte técnico o consultas:
- Documentación: Este archivo
- Issues: axelcasco32	
- Email: axelguillermocasco@gmail.com

---



---

## Roadmap Futuro

Funcionalidades planeadas:
- [ ] Autenticación de operadores
- [ ] Estadísticas avanzadas
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Sistema de prioridades (embarazadas, ancianos)
- [ ] Integración con sistemas de historia clínica
- [ ] App móvil para pacientes
- [ ] Notificaciones por SMS/WhatsApp

---

**Versión:** 1.0.0  
**Última actualización:** Julio 2026  
**Desarrollado por: Axel Guillermo Casco 41687533

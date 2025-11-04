// lib/mongodb.ts
/**
 * Conexión a MongoDB con Mongoose (TypeScript)
 * - Usa MONGODB_URI desde env
 * - Caché en global._mongoose para evitar múltiples conexiones en dev
 * - Retorna mongoose.Connection y exporta la instancia `mongoose`
 * - Resetea la promesa en caso de fallo para permitir reintentos
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Cache almacenado en `global` para persistir entre hot-reloads en dev.
 * Nombramos la propiedad `_mongoose` para evitar confusiones con la importación `mongoose`.
 */
declare global {
  // Añadimos la interfaz para la propiedad global usada por el caché
  // `conn` guarda la conexión activa, `promise` guarda la promesa en curso.
  var _mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

// Inicializamos el caché si no existe (operador moderno `??=`).
global._mongoose ??= { conn: null, promise: null };

/**
 * Conecta y retorna la conexión (`mongoose.Connection`).
 * - Reusa `global._mongoose.conn` si ya existe.
 * - Reusa `global._mongoose.promise` si hay una conexión en curso.
 * - Guarda la promesa en el caché para evitar múltiples intentos paralelos.
 */
export async function connectToDatabase(): Promise<mongoose.Connection> {
  // 1) Si ya hay una conexión activa, retornarla inmediatamente.
  if (global._mongoose?.conn) {
    return global._mongoose.conn;
  }

  // 2) Si no hay promesa en curso, crearla y cachearla.
  if (!global._mongoose?.promise) {
    // Puedes añadir opciones tipadas si las necesitas:
    // const options: mongoose.ConnectOptions = { bufferCommands: false };
    // global._mongoose.promise = mongoose.connect(MONGODB_URI, options);
    global._mongoose!.promise = mongoose.connect(MONGODB_URI!);
  }

  try {
    // 3) Esperar a que la promesa resuelva y conservar la conexión.
    const mongooseInstance = await global._mongoose!.promise;
    global._mongoose!.conn = mongooseInstance.connection;
    return global._mongoose!.conn;
  } catch (error) {
    // 4) Si falló la conexión, limpiar la promesa cacheada para permitir reintentos.
    global._mongoose!.promise = null;
    throw error;
  }
}

/**
 * Exportar la instancia `mongoose` es útil para registrar modelos en otros módulos:
 * import { mongoose, connectToDatabase } from '@/lib/mongodb';
 */
export { mongoose };


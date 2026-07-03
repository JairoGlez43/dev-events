import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

declare global {
  var _mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

// Inicializamos el caché si no existe (operador moderno `??=`).
global._mongoose ??= { conn: null, promise: null };

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


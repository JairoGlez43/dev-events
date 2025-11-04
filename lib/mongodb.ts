/**
 * lib/mongodb.ts
 *
 * Configuración de conexión a MongoDB usando Mongoose y TypeScript.
 * - Evita `any` usando los tipos que exporta Mongoose.
 * - Usa un caché en `global` para reusar la conexión durante hot-reloads
 *   (necesario en entornos como Next.js / dev servers que recargan módulos).
 * - Exporta la función `connectToDatabase` que retorna la conexión activa
 *   tipada como `mongoose.Connection`.
 *
 * Comentarios en cada bloque explican la razón y el comportamiento.
 */

import mongoose from 'mongoose';

// Leemos la URI desde variables de entorno. Lanzamos un error claro si no está.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  // Esto falla pronto y con mensaje claro si olvidas añadir la variable.
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Extendemos el tipo global para añadir nuestro caché de Mongoose.
 *
 * Usamos `global` (en Node) para mantener la conexión entre recargas de módulos
 * en desarrollo. Esto evita crear muchas conexiones simultáneas al servidor
 * de MongoDB durante el hot-reload.
 */
declare global {
  // Añadimos una propiedad `_mongoose` a `NodeJS.Global` para el caché.
  // No usamos `any` — tipamos la estructura explícitamente.
  // `mongoose.Mongoose` representa la instancia principal retornada por `mongoose.connect`.
  var _mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
  } | undefined;
}

// Inicializamos (o reutilizamos) el caché en `global`.
// El operador de asignación `??=` garantiza que sólo se cree si no existe.
global._mongoose ??= { conn: null, promise: null };

/**
 * Conecta a la base de datos y retorna la conexión activa.
 *
 * Comportamiento:
 * - Si ya existe `global._mongoose.conn` la retorna inmediatamente.
 * - Si hay una promesa en curso (`global._mongoose.promise`) espera a que termine.
 * - Si no hay nada, inicia `mongoose.connect(...)` y guarda la promesa en caché.
 *
 * Esto garantiza que, aun con múltiples llamadas concurrentes durante el inicio
 * de la aplicación, se reutilice la misma promesa/conexión en vez de crear
 * múltiples conexiones paralelas.
 */
export async function connectToDatabase(): Promise<mongoose.Connection> {
  // Si ya hay una conexión activa, la retornamos.
  if (global._mongoose?.conn) {
    return global._mongoose.conn;
  }

  // Si no hay promesa en curso, creamos una y la guardamos en el caché.
  if (!global._mongoose?.promise) {
  // mongoose.connect devuelve Promise<mongoose.Mongoose>
  // Usamos el operador non-null (!) porque ya hemos validado arriba que
  // `MONGODB_URI` existe; esto evita avisos del compilador sobre `undefined`.
  global._mongoose!.promise = mongoose.connect(MONGODB_URI!);
  }

  // Esperamos a que la promesa de conexión resuelva y guardamos la conexión.
  const mongooseInstance = await global._mongoose!.promise;
  global._mongoose!.conn = mongooseInstance.connection;

  // Retornamos la conexión tipada como mongoose.Connection.
  return global._mongoose!.conn;
}

/**
 * Exportamos la instancia de mongoose por si otros módulos necesitan acceso
 * directo a métodos estáticos (por ejemplo para crear modelos con `mongoose.model`).
 */
export { mongoose };

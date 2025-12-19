import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/database';
import type { EventDocument } from '@/database/event.model';

/**
 * GET /api/events/[slug]
 * - Valida y normaliza el parámetro `slug`.
 * - Asegura conexión con la base de datos.
 * - Busca el evento por `slug` y devuelve JSON con status adecuados.
 */
export async function GET(
  _req: NextRequest,
  context: { params: { slug?: string | string[] } | Promise<{ slug: string }> }
) {
  // Next.js typing can expose `context.params` as a Promise in some dev/build
  // generated types. A compatible approach is aceptar ambos: un objeto o una
  // promesa que resuelva a un objeto.
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const raw = resolvedParams?.slug;
  // --- 1) Validación del parámetro `slug` ---
  if (!raw) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
  }
  if (Array.isArray(raw)) {
    return NextResponse.json({ error: 'Multiple slug values provided' }, { status: 400 });
  }
  const slug = String(raw).trim();
  if (!slug) {
    return NextResponse.json({ error: 'Invalid slug parameter' }, { status: 400 });
  }

  try {
    // --- 2) Conexión a la base de datos ---
    await connectToDatabase();

    // --- 3) Búsqueda del evento ---
    // Retornamos el documento Mongoose (serializable). Usamos exec() para
    // obtener una Promise clara y manejo de errores consistente.
    const event: EventDocument | null = await Event.findOne({ slug }).exec();

    if (!event) {
      return NextResponse.json({ error: `Event with slug "${slug}" not found` }, { status: 404 });
    }

    // toJSON() se asegura de devolver un objeto plano listo para serializar.
    //console.log(newTagsFormat);
    const payload = typeof event.toJSON === 'function' ? event.toJSON() : event;
    //console.log(event.tags);  
    return NextResponse.json({ event: payload }, { status: 200 });
  } catch (err) {
    // Manejo de errores inesperados
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

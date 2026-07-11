import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/database';
import type { EventDocument } from '@/database/event.model';
export async function GET(
  _req: NextRequest,
  context: { params: { slug?: string | string[] } | Promise<{ slug: string }> }
) {
  const resolvedParams = await (context.params instanceof Promise ? context.params : Promise.resolve(context.params));
  const raw = resolvedParams?.slug;
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
    
    await connectToDatabase();
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

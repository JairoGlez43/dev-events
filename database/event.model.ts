import { mongoose } from '../lib/mongodb';

// Tipos TS para un documento Event
export interface EventAttrs {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // almacenamos como ISO date string (YYYY-MM-DD)
  time: string; // almacenamos como HH:MM (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

export interface EventDocument extends mongoose.Document, EventAttrs {
  createdAt: Date;
  updatedAt: Date;
}

// Helper: genera slug URL-friendly desde un título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // reemplaza no-alphanum por '-'
    .replace(/^-+|-+$/g, '') // elimina '-' al inicio/fin
    .replace(/-{2,}/g, '-'); // colapsa múltiples '-'
}

// Helper: normaliza la fecha a YYYY-MM-DD; lanza si no es válida
function normalizeDateToISO(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: "${dateStr}"`);
  }
  return d.toISOString().split('T')[0];
}

// Helper: normaliza hora a formato 24h HH:MM
function normalizeTimeToHHMM(timeStr: string): string {
  const trimmed = timeStr.trim();

  // 12-hour format like '9:30 AM' or '09:30 pm'
  const ampm = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampm) {
    let hour = parseInt(ampm[1], 10);
    const minute = ampm[2];
    const meridian = ampm[3].toLowerCase();
    if (meridian === 'pm' && hour !== 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // 24-hour format like '09:30' or '9:30'
  const hhmm = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    const hour = parseInt(hhmm[1], 10);
    const minute = hhmm[2];
    if (hour < 0 || hour > 23 || Number(minute) < 0 || Number(minute) > 59) {
      throw new Error(`Invalid time provided: "${timeStr}"`);
    }
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  throw new Error(`Unsupported time format: "${timeStr}"`);
}

const EventSchema = new mongoose.Schema<EventDocument>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: 'title cannot be empty',
      },
    },
    slug: { type: String, required: true, unique: true, index: true },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
    },
    overview: { type: String, required: [true, 'overview is required'], trim: true },
    image: { type: String, required: [true, 'image is required'], trim: true },
    venue: { type: String, required: [true, 'venue is required'], trim: true },
    location: { type: String, required: [true, 'location is required'], trim: true },
    date: { type: String, required: [true, 'date is required'], trim: true },
    time: { type: String, required: [true, 'time is required'], trim: true },
    mode: { type: String, required: [true, 'mode is required'], trim: true },
    audience: { type: String, required: [true, 'audience is required'], trim: true },
    agenda: {
      type: [String],
      required: [true, 'agenda is required'],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: 'agenda must be a non-empty array of strings',
      },
    },
    organizer: { type: String, required: [true, 'organizer is required'], trim: true },
    tags: {
      type: [String],
      required: [true, 'tags are required'],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: 'tags must be a non-empty array of strings',
      },
    },
  },
  {
    timestamps: true, // crea createdAt y updatedAt automáticamente
    strict: true,
  }
);

// Aseguramos un índice único en slug para búsquedas por URL.
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook:
// - Genera/actualiza el slug sólo si el título cambió.
// - Normaliza `date` a YYYY-MM-DD y `time` a HH:MM (24h); valida formatos.
EventSchema.pre<EventDocument>('save', async function () {
  // `this` es el documento que se guarda
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }

  // Normalizar/validar fecha
  if (this.isModified('date') || !this.date) {
    this.date = normalizeDateToISO(this.date);
  }

  // Normalizar/validar hora
  if (this.isModified('time') || !this.time) {
    this.time = normalizeTimeToHHMM(this.time);
  }
});

// Evitamos redefinir el modelo en dev/SSR donde los módulos se recargan.
export const Event =
  (mongoose.models.Event as mongoose.Model<EventDocument>) ||
  mongoose.model<EventDocument>('Event', EventSchema);

export default Event;

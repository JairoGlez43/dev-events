import { mongoose } from '../lib/mongodb';
import { Event } from './event.model';

// Tipos TS para Booking
export interface BookingAttrs {
  eventId: mongoose.Types.ObjectId;
  email: string;
}

export interface BookingDocument extends mongoose.Document, BookingAttrs {
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new mongoose.Schema<BookingDocument>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'eventId is required'],
      index: true, // índice para consultas rápidas por evento
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
      validate: {
        validator: (v: string) => emailRegex.test(v),
        message: 'email must be a valid email address',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Pre-save: verificar que el eventId referenciado existe.
BookingSchema.pre<BookingDocument>('save', async function () {
  // Comprobamos existencia del evento; lanzamos si no existe.
  const exists = await Event.exists({ _id: this.eventId });
  if (!exists) {
    throw new Error(`Referenced event not found: ${this.eventId}`);
  }
});

// Evitamos redefinir el modelo en entornos con recarga de módulos.
export const Booking =
  (mongoose.models.Booking as mongoose.Model<BookingDocument>) ||
  mongoose.model<BookingDocument>('Booking', BookingSchema);

export default Booking;

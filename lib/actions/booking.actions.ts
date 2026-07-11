'use server';
import {Booking} from '../../database/booking.model';
import {Event} from '../../database/event.model';
import { connectToDatabase } from '../mongodb';

interface CreateBookingInput {
  eventSlug: string;
  email: string;
}

interface CreateBookingOutput {
  ok: boolean;
  message: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createBooking = async ({eventSlug, email }: CreateBookingInput): Promise<CreateBookingOutput> => {
  try {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanEventSlug = eventSlug?.trim();
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { ok: false, message: 'Invalid email address' };
    }
    if (!cleanEventSlug) {
      return { ok: false, message: 'Invalid event slug' };
    }

    await connectToDatabase();
    const event = await Event.findOne({ slug: cleanEventSlug });
    if (!event) {
      return { ok: false, message: 'Event not found' };
    }

    const existingBooking = await Booking.exists({ eventId: event._id, email: cleanEmail });
    if (existingBooking) {
      return { ok: false, message: 'Booking already exists for this email' };
    }
    const totalBookings = await Booking.countDocuments({ eventId: event._id });
    const remainingcapacity = (event.capacity ?? 0) - totalBookings;
    if (remainingcapacity <= 0) {
      return { ok: false, message: 'Event is fully booked' };
    }

    await Booking.create({
      eventId: event._id,
      email: cleanEmail,
    });
    return { ok: true, message: 'Booking created successfully' };

  }catch (e) {
    return { ok: false, message: `${e instanceof Error ? e.message : 'Server error'}` };
  }
};
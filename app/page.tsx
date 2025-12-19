import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { EventAttrs } from "@/database/event.model";
import { cacheLife } from "next/dist/server/use-cache/cache-life";
//import events from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default async function Home() {
  // Fetch events from our API with robust error handling. We use a
  // relative fallback BASE_URL but still guard against network or
  // server errors and unexpected payload shapes.
  'use cache';
  cacheLife("hours");
  let events: EventAttrs[] = [];
  try {
    const res = await fetch(`${BASE_URL}/api/events`);
    if (!res.ok) {
      // Log and fall back to empty list on non-2xx responses.
      // In production you might surface a UI message instead.
      console.error(`Failed to fetch events: ${res.status} ${res.statusText}`);
    } else {
      const payload = await res.json();
      // Validate payload shape: must have events array
      if (payload && Array.isArray(payload.events)) {
        events = payload.events as EventAttrs[];
      } else {
        console.warn('Unexpected events payload shape, expected { events: [] }', payload);
      }
    }
  } catch (err) {
    // Network or parsing error: log and continue with empty events array
    console.error('Error fetching events:', err);
  }
  return (
    <section>
      <h1 className="text-center">
        Discover the best developer events
        <br />
  Event you can&apos;t miss
      </h1>
      <p className="text-center mt-5">
        Join us for an unforgettable experience!
      </p>
      <ExploreBtn />
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {(events && events.length > 0) && events.map((event:EventAttrs) => (
            <li key={event.slug} className="list-none">
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

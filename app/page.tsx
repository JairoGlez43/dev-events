import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { EventAttrs } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database";
import { cacheLife } from 'next/cache';

export default async function Home() {
  'use cache';
  cacheLife('hours');
  let events: EventAttrs[] = [];
   try {
    await connectToDatabase();
    const docs = await Event.find({}).sort({ createdAt: -1 }).lean().exec();
    // Serializar (ObjectId, Dates) para poder pasar los datos a componentes cliente
    events = JSON.parse(JSON.stringify(docs));
  } catch (err) {
    console.error("Error fetching events:", err);
  }

  console.log(events);
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

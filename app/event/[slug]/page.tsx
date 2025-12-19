import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { EventAttrs } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsIcon = ({icon, alt, label}: {icon:string, alt:string, label: string}) => (
    <div className="flex gap-2 items-center"> 
        <Image src={icon} alt={alt} height={17} width={17}/>
        <p>{label}</p>
    </div>
)

const EventAgenda = ({itemsAgenda}: {itemsAgenda: string[]}) => {
    return(
        <div className="agenda">
            <h2>Agenda</h2>
            <ul>
                {itemsAgenda.map((item)=>(
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    )
}

const EventTags = ({tags}: {tags: string[]})=>(
    <div className="flex flex-wrap gap-2">
        {tags.map((tag)=>(
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)
const EventDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {

    const {slug} =  await params;
    //console.log('Fetching event details for slug:', slug);
    const res = await fetch(`${BASE_URL}/api/events/${slug}`);
    if(!res.ok){
        return notFound();
    }        
    const {event: {description, mode, overview, image, date, time, location, audience, agenda, organizer, tags}} = await res.json();
    //console.log(tags);
    const booking = 10;
      
    const similarEvents: EventAttrs[] = await getSimilarEventsBySlug(slug);
    //console.log('Similar Events:', similarEvents);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p className="mt-2">{description}</p>
            </div>
            <div className="details">
                <div className="content">
                    <Image src={image} alt="Event banner" width={800} height={800} className="banner"/>

                    <section className="flex-col gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col gap-2">
                        <h2>Event Details</h2>
                        <EventDetailsIcon icon="/icons/calendar.svg" alt="calendar" label={date}/>
                        <EventDetailsIcon icon="/icons/clock.svg" alt="time" label={time}/>
                        <EventDetailsIcon icon="/icons/pin.svg" alt="location" label={location}/>
                        <EventDetailsIcon icon="/icons/mode.svg" alt="mode" label={mode}/>
                        <EventDetailsIcon icon="/icons/audience.svg" alt="audience" label={audience}/>
                    </section>

                    <EventAgenda itemsAgenda={agenda? agenda : []}></EventAgenda>

                    <section>
                        <h2>Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags? tags : []}/>
                </div>
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Event</h2>
                        {booking > 0 ? (
                            <p className="text-sm">{`Seats available: ${booking}`}</p>
                        ) : (
                            <p className="text-sm">Sold Out</p>
                        )}
                        <BookEvent />
                    </div>
                </aside>
            </div>
            <div className="flex flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((event: EventAttrs) => {
                        //console.log(event.image);
                        //console.log(event);
                        return (
                        <EventCard key={event.slug} {...event}/>
                    )})}
                </div>
            </div>
        </section>
  )
}

export default EventDetails;
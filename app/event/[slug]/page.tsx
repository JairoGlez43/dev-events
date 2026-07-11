import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { Event } from "@/database";
import { EventAttrs } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { connectToDatabase } from "@/lib/mongodb";
import Image from "next/image";
import { notFound } from "next/navigation";

const EventDetailsIcon = ({icon, alt, label}: {icon:string, alt:string, label: string}) => (
    <div className="flex gap-2 items-center"> 
        <Image src={icon} alt={alt} height={17} width={17} className="size-[17px]"/>
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
    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean().exec();
    if(!event){
        return notFound();
    }

    const {description, mode, overview, image, date, time, location, audience, agenda, organizer, tags, capacity} = JSON.parse(JSON.stringify(event)) as EventAttrs;
    //console.log(tags);
    const reservations = await Event.countDocuments({ slug });
    const booking = capacity?? 0 - reservations;
    const similarEvents: EventAttrs[] = await getSimilarEventsBySlug(slug);
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
                        <BookEvent slug={slug} />
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

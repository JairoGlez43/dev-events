import { EventAttrs } from "@/database/event.model"
import Image from "next/image"
import Link from "next/link"

const EventCard = ({title, image, location, date, time, slug}: EventAttrs) => {
    console.log(title,image, location, date, time, slug);
    return (
    <Link href={`/event/${slug}`} id="event-card">
        <Image src={image} alt={title} width={410} height={300} className="poster"/>
        <div className="flex gap-2">
            <Image src={'/icons/pin.svg'} alt="Location pin" width={14} height={14}/>
            <p>{location}</p>
        </div>
        <p className="title">{title}</p>
        <div className="datetime">
            <div>
                <Image src={'/icons/calendar.svg'} alt="calendar" width={14} height={14}/>
                <p>{date}</p>
            </div>
            <div>
                <Image src={'/icons/clock.svg'} alt="clock" width={14} height={14}/>
                <p>{time}</p>
            </div>
        </div>
    </Link>
  )
}

export default EventCard;
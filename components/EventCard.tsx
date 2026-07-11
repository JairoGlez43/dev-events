import { EventAttrs } from "@/database/event.model"
import Image from "next/image"
import Link from "next/link"

const EventCard = ({title, image, location, date, time, slug}: EventAttrs) => {
    return (
    <Link href={`/event/${slug}`} id="event-card">
        <div className="poster">
            <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover"
            />
        </div>
        <div className="flex gap-2">
            <Image src={'/icons/pin.svg'} alt="Location pin" width={14} height={14} className="size-3.5"/>
            <p>{location}</p>
        </div>
        <p className="title">{title}</p>
        <div className="datetime">
            <div>
                <Image src={'/icons/calendar.svg'} alt="calendar" width={14} height={14} className="size-3.5"/>
                <p>{date}</p>
            </div>
            <div>
                <Image src={'/icons/clock.svg'} alt="clock" width={14} height={14} className="size-3.5"/>
                <p>{time}</p>
            </div>
        </div>
    </Link>
  )
}

export default EventCard;
'use server'
import { Event } from "@/database";
import { connectToDatabase } from "../mongodb";

const getSimilarEventsBySlug = async (currentSlug: string) => {
    try {
        await connectToDatabase();
        // Usar .lean() para obtener objetos JSON planos en vez de documentos Mongoose
        const event = await Event.findOne({ slug: currentSlug }).lean().exec();
        //console.log(currentSlug);
        //console.log(event);
        if (!event) {
            console.warn('Event not found for slug:', currentSlug);
            return [];
        }

        const similarEvent = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags || [] }
        }).lean().exec();
        //console.log(event.tags);
        //console.log('Found event for slug:', currentSlug, event);
        //console.log('Similar events:', similarEvent);
        return similarEvent;

    } catch (err) {
        console.error('Error fetching similar events:', err);
        return [];
    }

}

export { getSimilarEventsBySlug };
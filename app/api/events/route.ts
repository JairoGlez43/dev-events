import { Event } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    let event;
    try {
      event = Object.fromEntries(formData);
    } catch (error) {
      console.error("Error parsing form data:", error);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }
    const imageData = await file.arrayBuffer();
    const imageBuffer = Buffer.from(imageData);
    //console.log(imageBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "events" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(imageBuffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;
    const tags = JSON.parse(formData.get('tags') as string);
    const agenda = JSON.parse(formData.get('agenda') as string);
    //console.log(event);
    event = {...event, tags: tags, agenda: agenda};
    //console.log(event);
                
    const createdEvent = await Event.create(event);
    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (error) {
    //console.error('Error handling POST request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching events",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

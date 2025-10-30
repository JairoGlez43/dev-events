export type DevEvent = {
  title: string;
  slug: string;
  image: string;
  location: string;
  venue?: string;
  date: string; // ISO date
  time: string; // HH:MM (24h)
  description?: string;
};

export const events: DevEvent[] = [
  {
    title: "Frontend Summit 2026",
    slug: "frontend-summit-2026",
    image: "/images/event1.png",
    location: "Barcelona, Spain",
    venue: "World Trade Center Barcelona",
    date: "2026-03-18",
    time: "09:00",
    description: "Two-day conference covering modern frontend tooling, performance, and design systems. Keynotes, workshops and networking.",
  },
  {
    title: "Serverless & JAMstack Meetup",
    slug: "serverless-jamstack-meetup-nyc",
    image: "/images/event2.png",
    location: "New York, USA",
    venue: "WeWork - Flatiron",
    date: "2026-04-12",
    time: "18:30",
    description: "Monthly meetup focusing on serverless architectures, edge functions and static-first deployments. Lightning talks + pizza.",
  },
  {
    title: "Hack the Future — 48h Hackathon",
    slug: "hack-the-future-48h",
    image: "/images/event3.png",
    location: "Lisbon, Portugal",
    venue: "Beta-i Labs",
    date: "2026-05-22",
    time: "10:00",
    description: "Community-driven hackathon for startups and students. Prizes for best use of open data and best accessibility-focused project.",
  },
  {
    title: "AI for Devs Conference",
    slug: "ai-for-devs-2026",
    image: "/images/event4.png",
    location: "San Francisco, USA",
    venue: "Moscone Center",
    date: "2026-06-10",
    time: "09:30",
    description: "Hands-on sessions on integrating AI into developer workflows, prompt engineering, and production best practices.",
  },
  {
    title: "React Native Community Day",
    slug: "rn-community-day-2026",
    image: "/images/event5.png",
    location: "Austin, USA",
    venue: "Capital Factory",
    date: "2026-07-03",
    time: "13:00",
    description: "One-day meet of React Native developers: performance tuning, animations and cross-platform patterns.",
  },
  {
    title: "Design & Dev Hackathon",
    slug: "design-dev-hack-2026",
    image: "/images/event6.png",
    location: "Berlin, Germany",
    venue: "Factory Berlin",
    date: "2026-09-04",
    time: "10:00",
    description: "Interdisciplinary hackathon pairing designers and developers to ship prototypes in 24 hours.",
  },
];

export default events;

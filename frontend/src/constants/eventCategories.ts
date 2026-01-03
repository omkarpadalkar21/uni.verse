import type { EventCategory } from "../types/event";
import { type Event } from "../types/event";

export const EVENT_CATEGORIES: EventCategory[] = [
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "WORKSHOP",
  "SEMINAR",
  "FEST",
  "COMPETITION",
  "OTHER"
];

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  TECHNICAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CULTURAL: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  SPORTS: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  WORKSHOP: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  SEMINAR: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  FEST: "bg-red-500/10 text-red-500 border-red-500/20",
  COMPETITION: "bg-green-500/10 text-green-500 border-green-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const DUMMY_EVENTS: Event[] = [
  {
    id: 1,
    title: "TechConnect 2026: AI & Machine Learning Summit",
    description: "Join industry experts for a deep dive into the latest AI trends, machine learning algorithms, and practical implementations.",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    startTime: "2026-01-25T14:00:00Z",
    endTime: "2026-01-25T18:00:00Z",
    venue: "Auditorium Block A, 3rd Floor",
    capacity: 200,
    registeredCount: 156,
    category: "TECHNICAL",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 1,
      name: "Computer Science Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CSC"
    }
  },
  {
    id: 2,
    title: "Annual Cultural Fest: Rhythm 2026",
    description: "A celebration of music, dance, and art showing the diverse talents of our university students.",
    bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    startTime: "2026-02-10T10:00:00Z",
    endTime: "2026-02-12T22:00:00Z",
    venue: "University Main Ground",
    capacity: 1000,
    registeredCount: 850,
    category: "FEST",
    registrationMode: "MANUAL_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 2,
      name: "Cultural Committee",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CulComm"
    }
  },
  {
    id: 3,
    title: "Inter-College Cricket Tournament",
    description: "Support your team in the fiercest cricket battle of the year.",
    bannerUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    startTime: "2026-01-28T09:00:00Z",
    endTime: "2026-01-30T17:00:00Z",
    venue: "Sports Complex Stadium",
    capacity: 500,
    registeredCount: 120,
    category: "SPORTS",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 3,
      name: "Uni Sports Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Sports"
    }
  },
  {
    id: 4,
    title: "Web Development Workshop: React & Next.js",
    description: "Hands-on workshop to build modern web applications using React and Next.js.",
    bannerUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    startTime: "2026-02-05T13:00:00Z",
    endTime: "2026-02-05T16:00:00Z",
    venue: "Lab 4, Computer Center",
    capacity: 50,
    registeredCount: 48,
    category: "WORKSHOP",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 1,
      name: "Computer Science Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CSC"
    }
  },
  {
    id: 5,
    title: "Startup Seminar: From Idea to IPO",
    description: "Learn from successful entrepreneurs about their journey and get feedback on your ideas.",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ab2855f978?w=800",
    startTime: "2026-02-15T11:00:00Z",
    endTime: "2026-02-15T13:00:00Z",
    venue: "Seminar Hall B",
    capacity: 150,
    registeredCount: 90,
    category: "SEMINAR",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 4,
      name: "Entrepreneurship Cell",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=ECell"
    }
  },
  {
    id: 6,
    title: "Photography Walk: Campus Architecture",
    description: "Join us for a morning photo walk capturing the beautiful architecture of our campus.",
    bannerUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    startTime: "2026-01-26T07:00:00Z",
    endTime: "2026-01-26T09:00:00Z",
    venue: "Main Gate",
    capacity: 30,
    registeredCount: 15,
    category: "CULTURAL",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 5,
      name: "Photography Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Photo"
    }
  },
  {
    id: 7,
    title: "Hackathon 2026: Code for Good",
    description: "24-hour hackathon focused on solving social issues through technology.",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c54be3855833?w=800",
    startTime: "2026-03-01T09:00:00Z",
    endTime: "2026-03-02T09:00:00Z",
    venue: "Innovation Hub",
    capacity: 100,
    registeredCount: 98,
    category: "COMPETITION",
    registrationMode: "MANUAL_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 1,
      name: "Computer Science Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CSC"
    }
  },
  {
    id: 8,
    title: "Yoga & Meditation Session",
    description: "Relax and rejuvenate with a guided yoga session.",
    bannerUrl: "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800",
    startTime: "2026-01-27T06:00:00Z",
    endTime: "2026-01-27T07:30:00Z",
    venue: "Open Air Theatre",
    capacity: 100,
    registeredCount: 45,
    category: "SPORTS",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 6,
      name: "Wellness Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Health"
    }
  },
  {
    id: 9,
    title: "Debate Competition: AI Ethics",
    description: "Debate the ethical implications of Artificial Intelligence in our daily lives.",
    bannerUrl: "https://images.unsplash.com/photo-1475721027767-f421f0cac3e4?w=800",
    startTime: "2026-02-20T14:00:00Z",
    endTime: "2026-02-20T17:00:00Z",
    venue: "Law School Auditorium",
    capacity: 80,
    registeredCount: 60,
    category: "COMPETITION",
    registrationMode: "MANUAL_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 7,
      name: "Debating Society",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Debate"
    }
  },
  {
    id: 10,
    title: "Music Night: Open Mic",
    description: "Showcase your musical talent or just enjoy a night of acoustic performances.",
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    startTime: "2026-02-14T19:00:00Z",
    endTime: "2026-02-14T22:00:00Z",
    venue: "Student Centre Plaza",
    capacity: 200,
    registeredCount: 150,
    category: "CULTURAL",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 8,
      name: "Music Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Music"
    }
  },
  {
    id: 11,
    title: "Robotics Exhibition",
    description: "See the latest robots built by our engineering students.",
    bannerUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    startTime: "2026-03-05T10:00:00Z",
    endTime: "2026-03-05T16:00:00Z",
    venue: "Main Hall",
    capacity: 500,
    registeredCount: 200,
    category: "TECHNICAL",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 9,
      name: "Robotics Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Robot"
    }
  },
   {
    id: 12,
    title: "Literature Festival",
    description: "A gathering of authors, poets, and book lovers.",
    bannerUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800",
    startTime: "2026-03-15T10:00:00Z",
    endTime: "2026-03-16T18:00:00Z",
    venue: "Library Lawns",
    capacity: 300,
    registeredCount: 120,
    category: "CULTURAL",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 10,
      name: "Literary Society",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Lit"
    }
  },
  {
    id: 13,
    title: "Chess Championship",
    description: "Test your strategic skills in the annual chess tournament.",
    bannerUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800",
    startTime: "2026-02-01T10:00:00Z",
    endTime: "2026-02-01T18:00:00Z",
    venue: "Student Centre Room 202",
    capacity: 64,
    registeredCount: 50,
    category: "SPORTS",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 11,
      name: "Board Games Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Chess"
    }
  },
  {
    id: 14,
    title: "Career Fair 2026",
    description: "Connect with top employers and find your dream job.",
    bannerUrl: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800",
    startTime: "2026-03-20T09:00:00Z",
    endTime: "2026-03-20T17:00:00Z",
    venue: "Convention Centre",
    capacity: 2000,
    registeredCount: 1500,
    category: "OTHER",
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 12,
      name: "Placement Cell",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Job"
    }
  },
  {
    id: 15,
    title: "Cybersecurity Workshop",
    description: "Learn how to protect systems and networks from digital attacks.",
    bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    startTime: "2026-02-25T14:00:00Z",
    endTime: "2026-02-25T17:00:00Z",
    venue: "Lab 2",
    capacity: 40,
    registeredCount: 40,
    category: "WORKSHOP",
    registrationMode: "MANUAL_APPROVE",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    club: {
      id: 1,
      name: "Computer Science Club",
      logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CSC"
    }
  }
];

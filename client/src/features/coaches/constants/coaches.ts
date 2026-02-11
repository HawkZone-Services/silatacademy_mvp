export interface Coach {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  experience: number;
  bio: string;
  achievements: string[];
  certifications: string[];
  email: string;
  phone: string;
  gallery: string[];
}

export const coaches: Coach[] = [
  {
    id: "1",
    name: "Guru Besar Ahmad Hidayat",
    title: "Chief Instructor & Founder",
    specialization: ["Jurus Mastery", "Traditional Weapons", "Philosophy"],
    experience: 35,
    bio: "Guru Besar Ahmad is a 7th degree black belt and has dedicated his life to preserving and teaching authentic Pencak Silat. He has trained national champions and taught internationally across Southeast Asia.",
    achievements: [
      "SEA Games Gold Medalist (1995, 1997)",
      "National Champion (1990-1998)",
      "Trained 15+ international champions",
      "Published 3 books on Silat philosophy",
    ],
    certifications: [
      "Master Instructor Certification - IPSI",
      "International Silat Federation Judge",
      "Sports Medicine Certification",
      "Youth Development Coach",
    ],
    email: "ahmad@silatacademy.com",
    phone: "+62 812-3456-7890",
    gallery: [
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    ],
  },
  {
    id: "2",
    name: "Coach Siti Rahma",
    title: "Senior Instructor - Women's Division",
    specialization: ["Flexibility Training", "Jurus 1-7", "Competition Prep"],
    experience: 18,
    bio: "Coach Siti specializes in developing female athletes and has pioneered techniques that enhance flexibility and speed. She believes in empowering women through martial arts discipline.",
    achievements: [
      "National Women's Champion (2010, 2012)",
      "Developed flexibility training curriculum",
      "Coached 8 female national champions",
      "International workshop facilitator",
    ],
    certifications: [
      "Level 3 Instructor Certification - IPSI",
      "Nutrition & Fitness Coach",
      "Child Protection Certification",
      "First Aid & CPR Certified",
    ],
    email: "siti@silatacademy.com",
    phone: "+62 813-4567-8901",
    gallery: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
      "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    ],
  },
  {
    id: "3",
    name: "Coach Budi Santoso",
    title: "Head Combat Instructor",
    specialization: ["Sparring", "Speed Training", "Competition Strategy"],
    experience: 22,
    bio: "Coach Budi brings real-world combat experience and competition strategy expertise. His training methods focus on reaction speed, tactical thinking, and mental resilience.",
    achievements: [
      "3x SEA Games Medalist",
      "National Team Coach (2015-2020)",
      "Developed combat strategy program",
      "MMA cross-training specialist",
    ],
    certifications: [
      "Level 4 Instructor Certification - IPSI",
      "Combat Sports Coach",
      "Sports Psychology Certification",
      "Strength & Conditioning Specialist",
    ],
    email: "budi@silatacademy.com",
    phone: "+62 814-5678-9012",
    gallery: [
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800",
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    ],
  },
  {
    id: "4",
    name: "Coach Dewi Lestari",
    title: "Junior Program Director",
    specialization: ["Beginner Training", "Youth Development", "Fundamentals"],
    experience: 12,
    bio: "Coach Dewi has a gift for teaching young students and making the fundamentals fun and engaging. She focuses on building strong foundations while keeping training enjoyable for kids.",
    achievements: [
      "Youth Development Award (2019)",
      "Trained 200+ junior students",
      "Created kids curriculum framework",
      "Regional junior champion (2008)",
    ],
    certifications: [
      "Level 2 Instructor Certification - IPSI",
      "Child Development Specialist",
      "Positive Coaching Alliance Certified",
      "Elementary Education Background",
    ],
    email: "dewi@silatacademy.com",
    phone: "+62 815-6789-0123",
    gallery: [
      "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    ],
  },
];

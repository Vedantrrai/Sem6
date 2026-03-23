export type UserRole = 'user' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  image: string; // <-- Added image property
}

export interface Worker {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  experience: string;
  avatar: string;
  skills: string[];
  availability: string;
  completedJobs: number;
  description?: string;
}

export interface Booking {
  id: string;
  userId: string;
  workerId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  address: string;
  paymentMethod: 'cod';
  notes?: string;
}

export const services: Service[] = [
  { id: '1', name: 'Plumber', category: 'Home Services', icon: '🔧', description: 'Professional plumbing services', image: '/services/plumber.png' },
  { id: '2', name: 'Electrician', category: 'Home Services', icon: '⚡', description: 'Electrical repairs and installations', image: '/services/electrician.png' },
  { id: '3', name: 'Carpenter', category: 'Home Services', icon: '🪚', description: 'Furniture and woodwork services', image: '/services/carpenter.png' },
  { id: '4', name: 'Painter', category: 'Home Services', icon: '🎨', description: 'Interior and exterior painting', image: '/services/painter.png' },
  { id: '5', name: 'Cleaner', category: 'Cleaning', icon: '🧹', description: 'Home and office cleaning services', image: '/services/cleaner.png' },
  { id: '6', name: 'AC Repair', category: 'Appliances', icon: '❄️', description: 'AC installation and repair', image: '/services/ac-repair.png' },
  { id: '7', name: 'Driver', category: 'Transport', icon: '🚗', description: 'Personal and professional drivers', image: '/services/driver.png' },
  { id: '8', name: 'Beautician', category: 'Beauty', icon: '💄', description: 'Beauty and grooming services', image: '/services/beautician.png' },
];

// ... rest of the file remains the same
export const workers: Worker[] = [
  // Plumbers
  {
    id: '1',
    name: 'Ramesh Yadav',
    service: 'Plumber',
    rating: 4.8,
    reviews: 156,
    hourlyRate: 350,
    experience: '8 years',
    avatar: '/workers/ramesh-yadav.png',
    skills: ['Pipe Fitting', 'Leak Repair', 'Bathroom Installation'],
    availability: 'Available',
    completedJobs: 342,
    description: 'Expert in pipe fitting & leakage repair.'
  },
  {
    id: '2',
    name: 'Sunil Sharma',
    service: 'Plumber',
    rating: 4.6,
    reviews: 121,
    hourlyRate: 300,
    experience: '5 years',
    avatar: '/workers/sunil-sharma.png',
    skills: ['Tap Replacement', 'Drain Cleaning', 'Water Heater Issues'],
    availability: 'Available',
    completedJobs: 210,
    description: 'Quick and reliable service.'
  },
  // Electricians
  {
    id: '3',
    name: 'Ankit Verma',
    service: 'Electrician',
    rating: 4.9,
    reviews: 203,
    hourlyRate: 400,
    experience: '10 years',
    avatar: '/workers/ankit-verma.png',
    skills: ['Wiring', 'Circuit Repair', 'Smart Home Setup'],
    availability: 'Available',
    completedJobs: 478,
    description: 'Handles wiring & appliance repair.'
  },
  {
    id: '4',
    name: 'Harish Meena',
    service: 'Electrician',
    rating: 4.7,
    reviews: 180,
    hourlyRate: 380,
    experience: '7 years',
    avatar: '/workers/harish-meena.png',
    skills: ['Lighting Installation', 'Fuse Box Repair', 'Inverter Setup'],
    availability: 'Busy',
    completedJobs: 350,
    description: 'Specialist in home installations.'
  },
  // Carpenters
  {
    id: '5',
    name: 'Deepak Mishra',
    service: 'Carpenter',
    rating: 4.5,
    reviews: 128,
    hourlyRate: 450,
    experience: '6 years',
    avatar: '/workers/deepak-mishra.png',
    skills: ['Furniture Making', 'Cabinet Installation', 'Wood Polish'],
    availability: 'Available',
    completedJobs: 267,
    description: 'Custom furniture & wood repair.'
  },
  {
    id: '6',
    name: 'Suresh Gupta',
    service: 'Carpenter',
    rating: 4.8,
    reviews: 195,
    hourlyRate: 420,
    experience: '12 years',
    avatar: '/workers/suresh-gupta.png',
    skills: ['Door Repair', 'Modular Kitchen', 'Custom Shelving'],
    availability: 'Available',
    completedJobs: 405,
    description: '10+ years of experience.'
  },
  // Cleaners
  {
    id: '7',
    name: 'Priya Singh',
    service: 'Cleaner',
    rating: 4.9,
    reviews: 176,
    hourlyRate: 250,
    experience: '4 years',
    avatar: '/workers/priya-singh.png',
    skills: ['Deep Cleaning', 'Office Cleaning', 'Sanitization'],
    availability: 'Available',
    completedJobs: 412,
    description: 'Professional home & office cleaning.'
  },
  {
    id: '8',
    name: 'Rekha Patel',
    service: 'Cleaner',
    rating: 4.7,
    reviews: 150,
    hourlyRate: 270,
    experience: '5 years',
    avatar: '/workers/rekha-patel.png',
    skills: ['Kitchen Cleaning', 'Bathroom Cleaning', 'Eco-friendly Products'],
    availability: 'Available',
    completedJobs: 320,
    description: 'Eco-friendly cleaning specialist.'
  },
  // Painters
  {
    id: '9',
    name: 'Mohan Das',
    service: 'Painter',
    rating: 4.8,
    reviews: 140,
    hourlyRate: 400,
    experience: '9 years',
    avatar: '/workers/mohan-das.png',
    skills: ['Interior Painting', 'Exterior Painting', 'Texture Work'],
    availability: 'Available',
    completedJobs: 280,
    description: 'Wall painting & color consultation.'
  },
  {
    id: '10',
    name: 'Shubham Rai',
    service: 'Painter',
    rating: 4.6,
    reviews: 110,
    hourlyRate: 380,
    experience: '6 years',
    avatar: '/workers/shubham-rai.png',
    skills: ['Wall Putty', 'Enamel Paint', 'Quick Finishing'],
    availability: 'Busy',
    completedJobs: 205,
    description: 'Fast and neat painting work.'
  },
  // Drivers
  {
    id: '11',
    name: 'Rajesh Kumar',
    service: 'Driver',
    rating: 4.7,
    reviews: 250,
    hourlyRate: 500,
    experience: '15 years',
    avatar: '/workers/rajesh-kumar.png',
    skills: ['City Driving', 'Long Distance', 'Luxury Cars'],
    availability: 'Available',
    completedJobs: 600,
    description: 'Experienced personal driver.'
  },
  {
    id: '12',
    name: 'Dinesh Saini',
    service: 'Driver',
    rating: 4.9,
    reviews: 220,
    hourlyRate: 520,
    experience: '10 years',
    avatar: '/workers/dinesh-saini.png',
    skills: ['Defensive Driving', 'Punctual', 'Route Planning'],
    availability: 'Available',
    completedJobs: 550,
    description: 'Safe and punctual professional driver.'
  },
];

export const testimonials = [
  {
    id: '1',
    name: 'Anjali Mehta',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
    rating: 5,
    text: 'Excellent service! The plumber arrived on time and fixed my issue quickly. Very professional.',
    service: 'Plumber'
  },
  {
    id: '2',
    name: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop',
    rating: 5,
    text: 'Found a great electrician through KaamOn. Highly recommend this platform!',
    service: 'Electrician'
  },
  {
    id: '3',
    name: 'Neha Kapoor',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop',
    rating: 5,
    text: 'The cleaning service was outstanding. My house looks brand new!',
    service: 'Cleaner'
  },
];
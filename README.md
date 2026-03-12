# KaamOn – Local Workers Booking Platform

## Project Description

KaamOn is a comprehensive local service booking platform designed to connect users seamlessly with trusted, verified local workers such as plumbers, electricians, carpenters, cleaners, and other home service professionals. 

Built with scalability and modern user experience in mind, KaamOn provides a frictionless discovery and booking process, dedicated intuitive dashboards for both workers and users, and intelligent features such as an ML-based chatbot assistant for tailored service recommendations.

## Features

- **User Authentication:** Secure signup and login flows with role-based access control (User, Worker, Admin).
- **Service Categories & Discovery:** Easily browse through various specialized service categories to find the right professional.
- **Job Booking System:** Seamless scheduling and booking system directly to individual workers.
- **Worker Dashboard:** Dedicated metrics, job management, and profile editing center for registered workers.
- **Worker Profile Management:** Workers can showcase their experience, skills, ratings, and dynamically adjusted hourly rates.
- **Chat Assistant (NLP-based):** Intelligent natural language intent classification chatbot to guide users and recommend specific services.
- **Ratings and Feedback:** Transparent review systems to ensure high-quality, trusted service.
- **Responsive Web Design:** Fully optimized fluid interfaces across desktop, tablet, and mobile viewing.

## Tech Stack

**Frontend:**
- Next.js (App Router)
- React
- Tailwind CSS
- TypeScript

**Backend:**
- Node.js
- Next.js API Routes / Express structure

**Database:**
- MongoDB (via Mongoose)

**Other Tools:**
- Framer Motion (Animations)
- Lucide React (Icons)
- Sonner (Toast notifications)

## Project Structure

```text
src/
 ├ app/
 │   ├ dashboard/
 │   ├ services/
 │   ├ login/
 │   └ signup/
 ├ components/
 ├ lib/
 └ styles/
```

## Installation Steps

Follow these steps to set up the project locally on your machine.

```bash
# Clone the repository
git clone https://github.com/yourusername/kaamon.git

# Move into project directory
cd kaamon

# Install dependencies
npm install
```

## MongoDB Setup

Configure your MongoDB connection by setting up your environment variables.

1. Create a `.env.local` file in the root directory.
2. Add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000
```

*Example backend connection configuration:*
```typescript
import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGODB_URI as string);
}
```

## Run the Project

Start the local development server:

```bash
npm run dev
```

Then open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

## Future Improvements

- AI-powered dynamic worker recommendations based on complex user history
- Enhanced smarter chatbot with deep context-awareness
- Dedicated mobile application using React Native
- Real-time geolocation-based job tracking
- Complete Payment Gateway integration (Stripe / Razorpay)

## License

This project is licensed under the MIT License.

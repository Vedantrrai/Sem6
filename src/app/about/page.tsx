"use client";

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { CheckCircle, Users, Shield, Clock, Star, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About
                <span className="bg-gradient-to-r from-[var(--orange)] to-[var(--blue)] bg-clip-text text-transparent"> KaamOn</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your trusted platform connecting customers with skilled local workers. 
                We make finding and booking services simple, safe, and affordable.
              </p>
            </div>

            {/* Mission Section */}
            <Card className="p-8 mb-12 glass">
              <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto">
                To empower local workers by connecting them with customers who need their services, 
                while providing a seamless, secure, and transparent booking experience with the 
                convenience of Cash on Delivery payment.
              </p>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {[
                {
                  icon: Users,
                  title: 'Verified Workers',
                  description: 'All workers are background verified and skill tested for your safety and satisfaction.'
                },
                {
                  icon: Shield,
                  title: 'Secure Platform',
                  description: 'Your data and transactions are protected with industry-standard security measures.'
                },
                {
                  icon: Clock,
                  title: 'Quick Booking',
                  description: 'Book services in minutes and get workers assigned within 24 hours.'
                },
                {
                  icon: Star,
                  title: 'Quality Assurance',
                  description: 'Rating and review system ensures only the best workers stay on our platform.'
                },
                {
                  icon: Award,
                  title: 'Expert Professionals',
                  description: 'Access to skilled workers with years of experience in their respective fields.'
                },
                {
                  icon: CheckCircle,
                  title: 'COD Payment',
                  description: 'Pay with cash after service completion. No advance payment required.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 glass h-full">
                    <feature.icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '500+', label: 'Verified Workers' },
                { value: '50K+', label: 'Bookings Completed' },
                { value: '4.8', label: 'Average Rating' }
              ].map((stat, index) => (
                <Card key={index} className="p-6 text-center glass">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[var(--orange)] to-[var(--blue)] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* How We Work Section */}
            <Card className="p-8 glass">
              <h2 className="text-3xl font-bold mb-8 text-center">How We Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Browse & Select</h3>
                  <p className="text-muted-foreground">
                    Browse through our verified workers, check their ratings, reviews, and select the best fit for your needs.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Book Service</h3>
                  <p className="text-muted-foreground">
                    Choose your preferred date and time, provide your address, and confirm your booking instantly.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Pay on Completion</h3>
                  <p className="text-muted-foreground">
                    Worker arrives at your location, completes the service, and you pay with cash. Simple and secure.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
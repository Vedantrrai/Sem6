"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { services, workers, testimonials } from '@/lib/mockData';
import { Star, CheckCircle, Clock, Shield, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const workerCategories = ['All', ...new Set(workers.map(w => w.service))];
  const filteredWorkers = selectedCategory === 'All'
    ? workers
    : workers.filter(worker => worker.service === selectedCategory);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* ===== START: Final Hero Section ===== */}
      <section className="relative flex items-center min-h-screen pt-24 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-cyan-50 dark:from-gray-900 dark:to-slate-800"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              className="flex flex-col justify-center"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
            >
              <div className="inline-flex items-center bg-muted text-muted-foreground text-me font-medium px-3 py-1 rounded-full mb-4 w-fit">
                <span className="text-primary font-bold mr-2">IN</span> “Har Kaam, Bas Ek Tap Mein!”
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                Find <span className="text-purple-600">Trusted</span> <span className="text-red-500">Local</span><br />
                Workers for Every Task
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-lg">
                Connect with verified plumbers, electricians, carpenters, and more. Book services instantly with Cash on Delivery payment.
              </p>
              <motion.p
                className="text-lg text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button asChild size="lg" className="bg-red-500 hover:bg-red-600 text-white text-lg px-8 w-full sm:w-auto">
                  <Link href="/services">
                    Book a Service
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-lg px-8 w-full sm:w-auto">
                  <Link href="/signup">
                    Become a Worker
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">5,000+</p>
                  <p className="text-sm text-muted-foreground">Verified Workers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">50,000+</p>
                  <p className="text-sm text-muted-foreground">Jobs Completed</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              <img
                src="/my-hero-image.png" // Make sure your image is in public/hero-image.jpg
                alt="KaamOn worker shaking hands with a happy family"
                className="rounded-3xl object-cover w-500 h-150 shadow-2xl"
              />

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="absolute -bottom-8 right-8 p-4 flex items-center gap-3 shadow-xl glass">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay after service completion</p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* ===== END: Final Hero Section ===== */}

      {/* ===== START: Updated Services Grid ===== */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Popular Services</h2>
            <p className="text-muted-foreground text-lg">Choose from our wide range of services</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/services?category=${service.category}`}>
                  <Card className="relative group overflow-hidden rounded-xl h-52 flex flex-col justify-end p-4 text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 z-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                    <div className="relative z-20">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <p className="text-sm text-white/80">{service.description}</p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ===== END: Updated Services Grid ===== */}

      {/* Featured Workers */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Top Rated Workers</h2>
            <p className="text-muted-foreground text-lg">Trusted professionals ready to serve you</p>
          </motion.div>

          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {workerCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`transition-all ${selectedCategory === category ? 'gradient-orange-blue text-white' : ''}`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredWorkers.map((worker, index) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="p-6 glass hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{worker.name}</h3>
                        <p className="text-sm text-muted-foreground">{worker.service}</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-semibold">{worker.rating}</span>
                          <span className="ml-1 text-sm text-muted-foreground">({worker.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hourly Rate</span>
                        <span className="font-semibold">₹{worker.hourlyRate}/hr</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-semibold">{worker.experience}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/services">
                    <Button className="w-full mt-4 gradient-orange-blue text-white">
                      Book Now
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg">Real reviews from satisfied customers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 glass">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <p className="text-sm text-primary mt-2">Service: {testimonial.service}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose KaamOn?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'Verified Workers', desc: 'All workers are background verified' },
              { icon: Clock, title: 'Quick Service', desc: 'Get service within 24 hours' },
              { icon: Shield, title: 'Secure Booking', desc: 'Safe and secure platform' },
              { icon: Star, title: 'Top Rated', desc: 'Only the best rated professionals' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center glass">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
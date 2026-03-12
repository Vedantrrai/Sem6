"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { services } from '@/lib/mockData';
import { workersAPI, bookingsAPI, type WorkerData } from '@/lib/apiClient';
import { getAuthState } from '@/lib/auth';
import { Star, Search, Clock, Award, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(new Date());
  const [bookingTime, setBookingTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch workers from MongoDB on category/search change
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoadingWorkers(true);
        const params: Record<string, string> = {};
        if (selectedCategory !== 'All') params.service = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        const res = await workersAPI.getAll(params);
        if (res.success) setWorkers(res.workers);
      } catch {
        toast.error('Failed to load workers. Is the database connected?');
      } finally {
        setLoadingWorkers(false);
      }
    };
    fetchWorkers();
  }, [selectedCategory, searchQuery]);

  const workerCategories = ['All', ...services.map(s => s.name)];

  const handleBookNow = (worker: WorkerData) => {
    const auth = getAuthState();
    if (!auth.isAuthenticated) {
      toast.error('Please login to book a service');
      return;
    }
    setSelectedWorker(worker);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedWorker || !bookingDate || !bookingTime || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setBookingLoading(true);
      const workerId = selectedWorker._id || selectedWorker.id;
      await bookingsAPI.create({
        workerId,
        date: bookingDate.toLocaleDateString('en-CA'),
        time: bookingTime,
        address,
        notes,
        amount: selectedWorker.hourlyRate,
      });

      toast.success('Booking Confirmed! 🎉', {
        description: (
          <div className="text-sm text-left">
            <p>Worker: <strong>{selectedWorker.name}</strong></p>
            <p>Date: <strong>{bookingDate.toLocaleDateString()}</strong> at <strong>{bookingTime}</strong></p>
            <p>Payment: <strong>Cash on Delivery</strong></p>
          </div>
        ),
        duration: 6000,
      });

      setBookingModalOpen(false);
      resetBookingForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookingForm = () => {
    setBookingDate(new Date());
    setBookingTime('');
    setAddress('');
    setNotes('');
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Your Perfect
                <span className="bg-gradient-to-r from-[var(--orange)] to-[var(--blue)] bg-clip-text text-transparent"> Worker</span>
              </h1>
              <p className="text-muted-foreground text-lg">Browse skilled professionals and book services instantly</p>
            </div>

            {/* Search and Filter */}
            <Card className="p-2 mb-8 glass flex items-center gap-2 flex-wrap sticky top-20 z-40">
              <div className="flex-grow flex items-center min-w-[250px]">
                <Search className="ml-4 mr-2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for workers or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 bg-transparent shadow-none !pl-0"
                />
              </div>
              <div className="flex gap-1 flex-wrap p-1 bg-muted rounded-lg">
                {workerCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-md transition-all ${selectedCategory === category ? 'gradient-orange-blue text-white shadow-sm' : ''
                      }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Workers Grid */}
            {loadingWorkers ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading workers from database...</p>
              </div>
            ) : workers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workers.map((worker, index) => (
                  <motion.div
                    key={worker.id || worker._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="p-6 glass hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      <div className="flex-grow">
                        <div className="flex flex-col items-center text-center mb-4">
                          <div className="relative mb-4">
                            <img
                              src={worker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`}
                              alt={worker.name}
                              className="w-24 h-24 rounded-full object-cover"
                            />
                            <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${worker.availability === 'Available'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-400 text-white'
                              }`}>
                              {worker.availability}
                            </div>
                          </div>
                          <h3 className="font-bold text-xl mb-1">{worker.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{worker.service}</p>
                          <div className="flex items-center space-x-1 mb-3">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{worker.rating}</span>
                            <span className="text-sm text-muted-foreground">({worker.reviews} reviews)</span>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Experience
                            </span>
                            <span className="font-semibold">{worker.experience}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              Completed
                            </span>
                            <span className="font-semibold">{worker.completedJobs} jobs</span>
                          </div>
                          <div className="pt-3 border-t border-border">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-sm">Hourly Rate</span>
                              <span className="text-2xl font-bold text-primary">₹{worker.hourlyRate}/hr</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-auto gradient-orange-blue text-white"
                        onClick={() => handleBookNow(worker)}
                        disabled={worker.availability !== 'Available'}
                      >
                        {worker.availability === 'Available' ? 'Book Now' : 'Not Available'}
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No workers found. Make sure the database is seeded.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Book {selectedWorker?.name}</DialogTitle>
            <DialogDescription>
              {selectedWorker?.service} • ₹{selectedWorker?.hourlyRate}/hr
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedWorker?.avatar || ''}
                  alt={selectedWorker?.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedWorker?.name}</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedWorker?.rating} ({selectedWorker?.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </Card>

            <div>
              <Label className="text-base font-semibold mb-3 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={bookingDate}
                onSelect={setBookingDate}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-base font-semibold mb-3 block">Select Time</Label>
              <Select value={bookingTime} onValueChange={setBookingTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address" className="text-base font-semibold mb-3 block">Service Address</Label>
              <Input
                id="address"
                placeholder="Enter your complete address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-semibold mb-3 block">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                  💰
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Cash on Delivery (COD)</h4>
                  <p className="text-sm text-muted-foreground">Pay cash after the service is completed. No advance payment required.</p>
                  <p className="text-lg font-bold mt-2 text-green-600">
                    Estimated: ₹{selectedWorker?.hourlyRate} - ₹{(selectedWorker?.hourlyRate || 0) * 2}
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                disabled={bookingLoading}
                onClick={() => {
                  setBookingModalOpen(false);
                  resetBookingForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gradient-orange-blue text-white"
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
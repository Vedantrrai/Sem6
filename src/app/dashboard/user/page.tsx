"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthState } from '@/lib/auth';
import { bookingsAPI, type BookingData } from '@/lib/apiClient';
import { Calendar, MapPin, Clock, User, Phone, Mail, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
  const [authState, setAuthState] = useState(getAuthState());
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const router = useRouter();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookingsAPI.getAll();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load bookings';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuthState();
    if (!auth.isAuthenticated || auth.user?.role !== 'user') {
      router.push('/login');
      return;
    }
    setAuthState(auth);
    fetchBookings();
  }, [router, fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancelling(bookingId);
      const res = await bookingsAPI.updateStatus(bookingId, 'cancelled');
      if (res.success) {
        toast.success('Booking cancelled');
        setBookings(prev =>
          prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel booking';
      toast.error(msg);
    } finally {
      setCancelling(null);
    }
  };

  if (!authState.user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'in-progress': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Resolve populated or ID fields
  const getWorkerName = (b: BookingData) => {
    if (typeof b.workerId === 'object') return b.workerId.name;
    return b.serviceType || 'Worker';
  };
  const getWorkerAvatar = (b: BookingData) => {
    if (typeof b.workerId === 'object' && b.workerId.avatar) return b.workerId.avatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${getWorkerName(b)}`;
  };

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {authState.user.name}!</p>
            </div>

            {/* Profile Card */}
            <Card className="p-6 mb-8 glass">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {authState.user.avatar ? (
                    <img src={authState.user.avatar} alt={authState.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">{authState.user.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <span>{authState.user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <span>{authState.user.phone}</span>
                    </div>
                    {authState.user.address && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span>{authState.user.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 glass">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold mt-2">{bookings.length}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-primary opacity-50" />
                </div>
              </Card>
              <Card className="p-6 glass">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-3xl font-bold mt-2">{completedBookings.length}</p>
                  </div>
                  <Clock className="w-12 h-12 text-green-500 opacity-50" />
                </div>
              </Card>
              <Card className="p-6 glass">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Spent</p>
                    <p className="text-3xl font-bold mt-2">₹{totalSpent}</p>
                  </div>
                  <CreditCard className="w-12 h-12 text-blue-500 opacity-50" />
                </div>
              </Card>
            </div>

            {/* Bookings List */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Bookings</h2>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchBookings}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    className="gradient-orange-blue text-white"
                    onClick={() => router.push('/services')}
                  >
                    Book New Service
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <Card className="p-12 text-center glass">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">Book your first service to get started!</p>
                  <Button
                    className="gradient-orange-blue text-white"
                    onClick={() => router.push('/services')}
                  >
                    Browse Services
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="p-6 glass">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <img
                            src={getWorkerAvatar(booking)}
                            alt={getWorkerName(booking)}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{getWorkerName(booking)}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{booking.serviceType}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{booking.date} at {booking.time}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{booking.address}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-muted-foreground">
                                <CreditCard className="w-4 h-4" />
                                <span>Cash on Delivery — ₹{booking.amount}</span>
                              </div>
                            </div>
                            {booking.notes && (
                              <p className="mt-2 text-sm text-muted-foreground italic">📝 {booking.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                          {booking.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              disabled={cancelling === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              {cancelling === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : 'Cancel'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
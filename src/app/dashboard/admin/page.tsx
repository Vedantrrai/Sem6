"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuthState } from '@/lib/auth';
import { adminAPI, bookingsAPI, workersAPI, type BookingData, type WorkerData } from '@/lib/apiClient';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [authState, setAuthState] = useState(getAuthState());
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalWorkers: number;
    totalBookings: number;
    totalRevenue: number;
    availableWorkers: number;
    statusBreakdown: Record<string, number>;
    recentBookings: BookingData[];
  } | null>(null);
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const [allWorkers, setAllWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, workersRes] = await Promise.all([
        adminAPI.getStats(),
        bookingsAPI.getAll(),
        workersAPI.getAll(),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (bookingsRes.success) setAllBookings(bookingsRes.bookings);
      if (workersRes.success) setAllWorkers(workersRes.workers);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load admin data';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuthState();
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setAuthState(auth);
    fetchData();
  }, [router, fetchData]);

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

  const getWorkerName = (b: BookingData) =>
    typeof b.workerId === 'object' ? b.workerId.name : 'Worker';
  const getUserName = (b: BookingData) =>
    typeof b.userId === 'object' && 'name' in b.userId ? b.userId.name : 'User';

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform overview and management</p>
              </div>
              <Button variant="outline" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="p-6 glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold mt-2">₹{stats?.totalRevenue || 0}</p>
                      </div>
                      <DollarSign className="w-12 h-12 text-green-500 opacity-50" />
                    </div>
                  </Card>
                  <Card className="p-6 glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Users</p>
                        <p className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-500 opacity-50" />
                    </div>
                  </Card>
                  <Card className="p-6 glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Workers</p>
                        <p className="text-3xl font-bold mt-2">{stats?.totalWorkers || 0}</p>
                      </div>
                      <Briefcase className="w-12 h-12 text-purple-500 opacity-50" />
                    </div>
                  </Card>
                  <Card className="p-6 glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Bookings</p>
                        <p className="text-3xl font-bold mt-2">{stats?.totalBookings || 0}</p>
                      </div>
                      <Calendar className="w-12 h-12 text-orange-500 opacity-50" />
                    </div>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="bookings" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="bookings">All Bookings ({allBookings.length})</TabsTrigger>
                    <TabsTrigger value="workers">Workers ({allWorkers.length})</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookings" className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
                    {allBookings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No bookings found</p>
                    ) : (
                      allBookings.map((booking) => (
                        <Card key={booking.id} className="p-6 glass">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-lg font-semibold">{booking.serviceType}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                  {booking.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Worker: </span>
                                  <span className="font-semibold">{getWorkerName(booking)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">User: </span>
                                  <span className="font-semibold">{getUserName(booking)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Date: </span>
                                  <span className="font-semibold">{booking.date} {booking.time}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Amount: </span>
                                  <span className="font-semibold text-green-600">₹{booking.amount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="workers" className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">All Workers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allWorkers.map((worker) => (
                        <Card key={worker.id} className="p-6 glass">
                          <div className="flex items-start space-x-4">
                            <img
                              src={worker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`}
                              alt={worker.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{worker.name}</h3>
                              <p className="text-sm text-muted-foreground">{worker.service}</p>
                              <div className="flex items-center mt-2 space-x-4 text-sm">
                                <span className="text-yellow-500">★ {worker.rating}</span>
                                <span className="text-muted-foreground">{worker.completedJobs} jobs</span>
                                <span className="text-muted-foreground">₹{worker.hourlyRate}/hr</span>
                                <span className={`px-2 py-1 rounded text-xs ${worker.availability === 'Available'
                                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                    : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                                  }`}>
                                  {worker.availability}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Platform Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 glass">
                        <div className="flex items-center space-x-3 mb-4">
                          <TrendingUp className="w-8 h-8 text-green-500" />
                          <h3 className="text-xl font-semibold">Booking Status Breakdown</h3>
                        </div>
                        <div className="space-y-3">
                          {['completed', 'confirmed', 'in-progress', 'pending', 'cancelled'].map(status => (
                            <div key={status} className="flex justify-between items-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                                {status.toUpperCase()}
                              </span>
                              <span className="font-semibold text-lg">
                                {stats?.statusBreakdown?.[status] || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-6 glass">
                        <div className="flex items-center space-x-3 mb-4">
                          <DollarSign className="w-8 h-8 text-blue-500" />
                          <h3 className="text-xl font-semibold">Revenue Breakdown</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Revenue (Completed)</span>
                            <span className="font-semibold text-green-600">₹{stats?.totalRevenue || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Bookings</span>
                            <span className="font-semibold">{stats?.totalBookings || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available Workers</span>
                            <span className="font-semibold text-green-600">{stats?.availableWorkers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Registered Users</span>
                            <span className="font-semibold">{stats?.totalUsers || 0}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
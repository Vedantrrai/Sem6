"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAuthState, updateAuthStateUser } from '@/lib/auth';
import { bookingsAPI, workersAPI, type BookingData, type WorkerData } from '@/lib/apiClient';
import { Calendar, MapPin, Clock, User, Phone, Mail, DollarSign, CheckCircle, XCircle, Loader2, RefreshCw, Edit3, Star, ToolCase, History, Save, X, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkerDashboard() {
  const [authState, setAuthState] = useState(getAuthState());
  const [jobRequests, setJobRequests] = useState<BookingData[]>([]);
  const [workerProfile, setWorkerProfile] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<WorkerData>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!authState.user) return;
    try {
      setLoading(true);

      // Fetch Worker Profile
      const workerRes = await workersAPI.getAll({ userId: authState.user.id });
      if (workerRes.success && workerRes.workers.length > 0) {
        setWorkerProfile(workerRes.workers[0]);
        setEditData(workerRes.workers[0]);
      }

      // Fetch Bookings (Jobs)
      const res = await bookingsAPI.getAll();
      if (res.success) {
        setJobRequests(res.bookings);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [authState.user]);

  useEffect(() => {
    const auth = getAuthState();
    if (!auth.isAuthenticated || auth.user?.role !== 'worker') {
      router.push('/login');
      return;
    }
    setAuthState(auth);
  }, [router]);

  useEffect(() => {
    if (authState.user) {
      fetchData();
    }
  }, [fetchData, authState.user]);

  const updateJobStatus = async (jobId: string, status: BookingData['status']) => {
    try {
      setUpdating(jobId);
      const res = await bookingsAPI.updateStatus(jobId, status);
      if (res.success) {
        toast.success(res.message);
        setJobRequests(prev =>
          prev.map(j => j.id === jobId ? { ...j, status } : j)
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(msg);
    } finally {
      setUpdating(null);
    }
  };

  const handleProfileSave = async () => {
    if (!workerProfile?.id) return;
    try {
      setSavingProfile(true);
      const res = await workersAPI.update(workerProfile.id, {
        hourlyRate: Number(editData.hourlyRate),
        experience: editData.experience,
        description: editData.description,
        avatar: editData.avatar,
      });
      if (res.success && res.worker) {
        setWorkerProfile(res.worker);
        toast.success('Profile updated successfully');
        setIsEditing(false);

        // Update global auth state avatar if changed
        if (editData.avatar && authState.user) {
           const updatedUser = updateAuthStateUser({ avatar: editData.avatar });
           if (updatedUser) {
             setAuthState({ isAuthenticated: true, user: updatedUser });
           }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!authState.user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-[#0056D2]/10 text-[#0056D2] border-[#0056D2]/20';
      case 'pending': return 'bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/20';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const totalEarnings = jobRequests.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.amount, 0);
  const completedJobsList = jobRequests.filter(j => j.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pendingRequests = jobRequests.filter(j => j.status === 'pending');
  const activeJobs = jobRequests.filter(j => j.status === 'confirmed' || j.status === 'in-progress');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navigation />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight">Worker Dashboard</h1>
                <p className="text-muted-foreground flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Manage your jobs, modify profile and track earnings.
                </p>
              </div>
              <Button onClick={fetchData} variant="outline" size="sm" className="hidden sm:flex border-gray-200 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>

            {loading && !workerProfile && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#FF7A00]" />
              </div>
            )}

            {!loading && workerProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile & Stats */}
                <div className="space-y-8">

                  {/* Profile Card */}
                  <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative">
                    <div className="h-32 bg-gradient-to-br from-[#FF7A00] to-[#0056D2] opacity-80" />

                    <div className="px-6 pb-6 relative">
                      <div className="flex justify-between items-start">
                        <div className="relative -mt-16 w-32 h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden flex-shrink-0">
                          {isEditing ? (
                            <div className="relative w-full h-full group">
                              <img src={editData.avatar || workerProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Label htmlFor="avatar-upload" className="cursor-pointer text-white font-medium text-xs text-center flex flex-col items-center">
                                  <Edit3 className="w-5 h-5 mb-1" /> Change
                                </Label>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                              </div>
                            </div>
                          ) : (
                            <img src={workerProfile.avatar} alt={workerProfile.name} className="w-full h-full object-cover" />
                          )}
                        </div>

                        {!isEditing && (
                          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="mt-4 text-[#0056D2] bg-[#0056D2]/5 hover:bg-[#0056D2]/10 transition-colors">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>

                      <AnimatePresence mode="wait">
                        {isEditing ? (
                          <motion.div
                            key="editing"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 space-y-4"
                          >
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wider">Hourly Rate (₹)</Label>
                              <Input type="number" value={editData.hourlyRate || ''} onChange={e => setEditData({ ...editData, hourlyRate: Number(e.target.value) })} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wider">Experience</Label>
                              <Input type="text" value={editData.experience || ''} onChange={e => setEditData({ ...editData, experience: e.target.value })} className="mt-1" />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase tracking-wider">Bio / Description</Label>
                              <Textarea rows={3} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} className="mt-1 resize-none" />
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button onClick={handleProfileSave} disabled={savingProfile} className="flex-1 bg-[#FF7A00] hover:bg-[#E66E00] text-white">
                                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                              </Button>
                              <Button onClick={() => { setIsEditing(false); setEditData(workerProfile); }} variant="outline" className="flex-1" disabled={savingProfile}>
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="viewing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <h2 className="text-2xl font-bold mt-4 text-gray-900">{workerProfile.name}</h2>
                            <p className="text-[#0056D2] font-medium text-sm mt-1">{workerProfile.service} Professional</p>

                            <div className="flex flex-wrap gap-2 mt-4 text-sm tracking-tight">
                              <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                                <Star className="w-3.5 h-3.5 mr-1 fill-yellow-500 text-yellow-500" /> {workerProfile.rating} ({workerProfile.reviews} reviews)
                              </span>
                              <span className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                                <ToolCase className="w-3.5 h-3.5 mr-1" /> {workerProfile.experience} Exp
                              </span>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                                {authState.user.address || 'Location not specified'}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                                {authState.user.phone}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <DollarSign className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="font-semibold text-gray-900">₹{workerProfile.hourlyRate}</span> / hour
                              </div>
                            </div>

                            {workerProfile.description && (
                              <p className="mt-6 text-sm text-gray-500 leading-relaxed italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                                &ldquo;{workerProfile.description}&rdquo;
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>

                  {/* Stats Card */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-5 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white hover:border-[#FF7A00]/50 transition-colors border border-transparent">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
                      <p className="text-2xl font-bold mt-1 text-gray-900">₹{totalEarnings}</p>
                    </Card>

                    <Card className="p-5 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white hover:border-[#0056D2]/50 transition-colors border border-transparent">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Completed Jobs</p>
                      <p className="text-2xl font-bold mt-1 text-gray-900">{completedJobsList.length}</p>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="p-6 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center mb-4">
                      <History className="w-5 h-5 mr-2 text-gray-400" />
                      Recent Activity
                    </h3>

                    {completedJobsList.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No completed jobs yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {completedJobsList.slice(0, 3).map((job) => (
                          <div key={job.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-gray-800">{typeof job.userId === 'object' ? job.userId.name : 'Customer'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{job.date}</p>
                            </div>
                            <span className="font-bold text-green-600">+₹{job.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Right Column: Job Requests */}
                <div className="lg:col-span-2 space-y-6">

                  {/* NEW / PENDING REQUESTS */}
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                      Incoming Requests
                      {pendingRequests.length > 0 && (
                        <span className="ml-3 px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold leading-none">{pendingRequests.length} New</span>
                      )}
                    </h2>

                    {pendingRequests.length === 0 ? (
                      <Card className="p-10 border-dashed border-2 bg-transparent shadow-none border-gray-200 text-center text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No new job requests</p>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.map(job => (
                          <Card key={job.id} className="p-0 overflow-hidden border-[#FF7A00]/20 shadow-md">
                            <div className="p-1 bg-[#FF7A00]" />
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase bg-[#FF7A00]/10 text-[#FF7A00] mb-2">New Request</span>
                                  <h3 className="text-lg font-bold text-gray-900">{typeof job.userId === 'object' ? job.userId.name : 'Customer'}</h3>
                                  {typeof job.userId === 'object' && 'phone' in job.userId && (
                                    <a href={`tel:${job.userId.phone}`} className="text-sm text-gray-500 hover:text-[#0056D2] flex items-center mt-1">
                                      <Phone className="w-3.5 h-3.5 mr-1.5" /> {job.userId.phone}
                                    </a>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-black text-gray-900">₹{job.amount}</p>
                                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1">Est. Payout</p>
                                </div>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm mb-5 border border-gray-100">
                                <div className="flex items-center text-gray-700">
                                  <Calendar className="w-4 h-4 mr-2 text-[#0056D2]" /> <span className="font-medium">{job.date}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <Clock className="w-4 h-4 mr-2 text-[#FF7A00]" /> <span className="font-medium">{job.time}</span>
                                </div>
                                <div className="flex items-start text-gray-700 col-span-2">
                                  <MapPin className="w-4 h-4 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="leading-tight">{job.address}</span>
                                </div>
                              </div>

                              {job.notes && (
                                <p className="text-sm text-gray-600 mb-5 pl-3 border-l-2 border-gray-300 italic">
                                  "{job.notes}"
                                </p>
                              )}

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => updateJobStatus(job.id, 'confirmed')}
                                  disabled={updating === job.id}
                                  className="flex-1 bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-900/20"
                                >
                                  {updating === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Accept Job</>}
                                </Button>
                                <Button
                                  onClick={() => updateJobStatus(job.id, 'cancelled')}
                                  disabled={updating === job.id}
                                  variant="outline"
                                  className="flex-1 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Decline
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE JOBS */}
                  <div className="pt-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Active & Ongoing Jobs</h2>

                    {activeJobs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No active jobs at the moment.</p>
                    ) : (
                      <div className="space-y-4">
                        {activeJobs.map(job => (
                          <Card key={job.id} className="p-5 border-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all bg-white relative overflow-hidden">
                            {/* Status line */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${job.status === 'in-progress' ? 'bg-[#0056D2]' : 'bg-green-500'}`} />

                            <div className="pl-3">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold text-gray-900">{typeof job.userId === 'object' ? job.userId.name : 'Customer'}</h3>
                                  <p className="text-xs text-gray-500 mt-0.5">{job.date} at {job.time}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(job.status)}`}>
                                  {job.status.toUpperCase()}
                                </span>
                              </div>

                              <p className="text-sm text-gray-700 flex items-start mb-4 bg-gray-50/50 p-2.5 rounded border border-gray-100">
                                <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                {job.address}
                              </p>

                              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                {job.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateJobStatus(job.id, 'in-progress')}
                                    disabled={updating === job.id}
                                    className="bg-[#0056D2] hover:bg-[#0047B3] text-white"
                                  >
                                    Begin Work
                                  </Button>
                                )}
                                {job.status === 'in-progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateJobStatus(job.id, 'completed')}
                                    disabled={updating === job.id}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
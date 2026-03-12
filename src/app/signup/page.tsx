"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import { signup } from '@/lib/auth';
import { UserRole } from '@/lib/mockData';
import { ArrowLeft, User, Briefcase, Shield, Loader2, Upload, X } from 'lucide-react';

const SERVICE_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Cleaner',
  'AC Repair',
  'Driver',
  'Beautician',
];

export default function SignupPage() {
  // General User fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  // Worker specific fields
  const [service, setService] = useState(SERVICE_CATEGORIES[0]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');
  const [address, setAddress] = useState(''); // Location/City
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string>('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAvatarBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let extraData = {};
    if (role === 'worker') {
      if (!hourlyRate || !experience) {
        setError('Please fill in all worker details');
        setLoading(false);
        return;
      }
      extraData = {
        service,
        hourlyRate: Number(hourlyRate),
        experience,
        address,
        skills,
        description,
        avatar: avatarBase64 || undefined,
      };
    } else if (role === 'user') {
      extraData = { address };
    }

    try {
      const result = await signup(name, email, password, role, phone, extraData);

      if (result.success && result.user) {
        switch (result.user.role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'worker':
            router.push('/dashboard/worker');
            break;
          default:
            router.push('/dashboard/user');
        }
      } else {
        setError(result.error || 'Signup failed');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const roles = [
    { value: 'user' as UserRole, label: 'User', icon: User, description: 'Book services' },
    { value: 'worker' as UserRole, label: 'Worker', icon: Briefcase, description: 'Provide services' },
    { value: 'admin' as UserRole, label: 'Admin', icon: Shield, description: 'Manage platform' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 glass overflow-hidden">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-muted-foreground">Join KaamOn today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-3 block">Select Your Role</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${role === r.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <r.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">{r.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="mt-2"
                    />
                  </div>

                  {role !== 'admin' && (
                    <div>
                      <Label htmlFor="address">Location / City {role === 'worker' ? '*' : '(Optional)'}</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required={role === 'worker'}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {role === 'worker' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-4 mt-6 border-t">
                        <h3 className="text-lg font-semibold text-primary">Worker Profile Details</h3>

                        <div className="flex items-start space-x-6 pb-2">
                          <div className="flex-shrink-0">
                            <Label className="block mb-2">Profile Photo</Label>
                            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden group">
                              {avatarBase64 ? (
                                <>
                                  <img src={avatarBase64} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-6 h-6" />
                                  </button>
                                </>
                              ) : (
                                <div className="text-center">
                                  <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                                  <span className="text-[10px] text-gray-500">Upload</span>
                                </div>
                              )}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={!!avatarBase64}
                              />
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div>
                              <Label htmlFor="service">Service Category *</Label>
                              <select
                                id="service"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                required
                              >
                                {SERVICE_CATEGORIES.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="experience">Experience *</Label>
                            <Input
                              id="experience"
                              type="text"
                              placeholder="e.g. 5+ Years"
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              required
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label htmlFor="rate">Hourly Rate (₹) *</Label>
                            <Input
                              id="rate"
                              type="number"
                              min="50"
                              placeholder="e.g. 500"
                              value={hourlyRate}
                              onChange={(e) => setHourlyRate(e.target.value)}
                              required
                              className="mt-2"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="skills">Skills (comma separated)</Label>
                          <Input
                            id="skills"
                            type="text"
                            placeholder="e.g. Pipe Repair, Tap Installation"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Short Bio / Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Tell customers a bit about yourself and your expertise..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 resize-none"
                            rows={3}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 shadow-sm font-medium flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-orange-blue text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:pointer-events-none"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Setting up your account...
                    </>
                  ) : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
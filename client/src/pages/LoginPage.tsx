import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  BrainCircuit,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useApp();

  const [email, setEmail] = useState('admin@campusiq.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      await login(email, password);
      addToast('success', 'Authentication Successful', `Welcome to CampusIQ Command Center.`);
    } catch (err: any) {
      addToast('error', 'Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);

    try {
      await login(demoEmail, 'password123');
      addToast('success', 'Logged in via Demo Credentials', `Logged in as ${demoEmail}.`);
    } catch (err: any) {
      addToast('error', 'Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F7F7F5] text-[#30383D]">
      <div className="w-full max-w-md">
        {/* Brand Header matching reference typography */}
        <div className="mb-8">
          <div className="inline-flex p-3 rounded-[14px] bg-white border border-[#D7D7D5] shadow-sm mb-4">
            <BrainCircuit className="w-6 h-6 text-[#30383D]" />
          </div>
          <h1 className="font-serif text-[40px] sm:text-[44px] font-bold leading-[1.0] tracking-tight text-[#30383D]">
            Campus Spaces<br />
            Tailored to You
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
            AI-powered intelligent resource allocation for classrooms, laboratories, and lecture halls across modern universities.
          </p>
        </div>

        {/* Login Editorial Card */}
        <div className="bg-white border border-[#D7D7D5] rounded-[16px] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#30383D] uppercase tracking-wider mb-1.5 font-sans">
                University Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#73777A] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campusiq.com"
                  required
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] pl-10 pr-4 py-2.5 text-sm text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#30383D] uppercase tracking-wider mb-1.5 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#73777A] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] pl-10 pr-4 py-2.5 text-sm text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 font-sans">
              <label className="flex items-center gap-2 text-[#73777A] cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[#D7D7D5] text-[#30383D] focus:ring-0"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[#30383D] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Roles Section */}
          <div className="mt-8 pt-6 border-t border-[#D7D7D5]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#73777A] mb-3 uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#30383D]" />
              <span>1-Click Hackathon Demo Roles:</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@campusiq.com')}
                className="p-3 rounded-[12px] bg-[#F7F7F5] hover:bg-[#E5E7EB] border border-[#D7D7D5] text-center transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#30383D] mx-auto mb-1" />
                <span className="block text-xs font-bold text-[#30383D]">Admin</span>
                <span className="text-[10px] text-[#73777A]">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('faculty@campusiq.com')}
                className="p-3 rounded-[12px] bg-[#F7F7F5] hover:bg-[#E5E7EB] border border-[#D7D7D5] text-center transition"
              >
                <Briefcase className="w-4 h-4 text-[#30383D] mx-auto mb-1" />
                <span className="block text-xs font-bold text-[#30383D]">Faculty</span>
                <span className="text-[10px] text-[#73777A]">Staff Bookings</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@campusiq.com')}
                className="p-3 rounded-[12px] bg-[#F7F7F5] hover:bg-[#E5E7EB] border border-[#D7D7D5] text-center transition"
              >
                <GraduationCap className="w-4 h-4 text-[#30383D] mx-auto mb-1" />
                <span className="block text-xs font-bold text-[#30383D]">Student</span>
                <span className="text-[10px] text-[#73777A]">Requests Only</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../schemas/auth.schema';
import { signupUser } from '../api/auth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, ArrowRight, Shield, Users } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function SignupPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', role: 'MEMBER' },
  });

  const selectedRole = watch('role');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await signupUser(data);
      login(result.token, result.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-primary-700 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMEgydjRoMzR6TTIgMjB2MmgzNHYtMkgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
              <p className="text-sm text-purple-200">Team Task Manager</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Start managing
            <br />
            <span className="text-purple-200">your team today</span>
          </h2>

          <p className="text-lg text-purple-100/80 max-w-md mb-10">
            Create an account and take control of your team's productivity with powerful task management tools.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, label: 'Secure & Private' },
              { icon: Users, label: 'Team Collaboration' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3">
                <Icon className="w-5 h-5 text-purple-300" />
                <span className="text-sm text-purple-100">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">TaskFlow</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-slate-400">Get started with TaskFlow in seconds</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="signup-name"
              label="Full Name"
              placeholder="John Doe"
              icon={User}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="signup-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'MEMBER', label: 'Member', desc: 'View & update tasks', icon: Users },
                  { value: 'ADMIN', label: 'Admin', desc: 'Full access', icon: Shield },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue('role', role.value)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200',
                      selectedRole === role.value
                        ? 'bg-primary-600/10 border-primary-500/50 ring-1 ring-primary-500/30'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                    )}
                  >
                    <role.icon className={cn(
                      'w-5 h-5',
                      selectedRole === role.value ? 'text-primary-400' : 'text-slate-500'
                    )} />
                    <div>
                      <p className={cn(
                        'text-sm font-medium',
                        selectedRole === role.value ? 'text-primary-300' : 'text-slate-300'
                      )}>
                        {role.label}
                      </p>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-xs text-rose-400">{errors.role.message}</p>}
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

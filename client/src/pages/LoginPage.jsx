import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/auth.schema';
import { loginUser } from '../api/auth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await loginUser(data);
      login(result.token, result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      toast.error(typeof errorMsg === 'string' ? errorMsg : err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMEgydjRoMzR6TTIgMjB2MmgzNHYtMkgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
              <p className="text-sm text-primary-200">Team Task Manager</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Streamline your
            <br />
            <span className="text-primary-200">team workflow</span>
          </h2>

          <p className="text-lg text-primary-100/80 max-w-md mb-10">
            Manage projects, assign tasks, and track progress with a modern, intuitive dashboard built for teams.
          </p>

          <div className="space-y-4">
            {[
              'Role-based access control',
              'Real-time analytics dashboard',
              'Project & task management',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-300 flex-shrink-0" />
                <span className="text-primary-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
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
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-2"
              size="lg"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <p className="text-xs font-medium text-slate-400 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p>Admin: <span className="text-slate-300">admin@taskflow.com</span> / <span className="text-slate-300">Admin@1234</span></p>
              <p>Member: <span className="text-slate-300">sarah@taskflow.com</span> / <span className="text-slate-300">Member@1234</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

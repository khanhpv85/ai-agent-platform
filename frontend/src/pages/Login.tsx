import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/UI';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { LoginFormData } from '@types';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await login(formData);
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Login successful!');
      }
    } catch (error) {
      // Error is handled in useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-primary-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
              />
              
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                autoComplete="current-password"
              />

              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                className="mt-6"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  <UserPlus className="inline h-4 w-4 mr-1" />
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/UI';
import { Mail, Lock, Eye, EyeOff, User, Building, UserPlus, LogIn } from 'lucide-react';
import { RegisterFormData } from '@types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated, clearError } = useAuth();

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
    
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.firstName || !formData.lastName || !formData.companyName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName,
      });
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Registration successful!');
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
              <UserPlus className="h-6 w-6 text-primary-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create your account
            </CardTitle>
            <CardDescription>
              Join us and start managing your AI agents
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  autoComplete="given-name"
                />
                
                <Input
                  label="Last name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Company name"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your Company"
                leftIcon={<Building className="h-4 w-4" />}
                required
                autoComplete="organization"
              />
              
              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
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
                placeholder="Create a password"
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
                autoComplete="new-password"
                helperText="Must be at least 8 characters"
              />

              <Input
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                autoComplete="new-password"
                error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : undefined}
              />

              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                className="mt-6"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  <LogIn className="inline h-4 w-4 mr-1" />
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;

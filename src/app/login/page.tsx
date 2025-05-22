'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaApple } from 'react-icons/fa';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      // Store user data in localStorage
      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      // Redirect to onboarding
      router.push('/onboarding/question1');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">RunMaster</h1>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="signin" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Let's get started by filling out the form below.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="h-12 rounded-full"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="h-12 rounded-full pr-10"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>

                  <Button variant="ghost" className="w-full">
                    Forgot Password?
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500">Or sign in with</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-12 rounded-full">
                      <FaGoogle className="mr-2" />
                      Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-full">
                      <FaApple className="mr-2" />
                      Continue with Apple
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Let's get started by filling out the form below.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="h-12 rounded-full"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="h-12 rounded-full"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        className="h-12 rounded-full pr-10"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className="h-12 rounded-full pr-10"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}

                  <Button 
                    className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleSignUp}
                  >
                    Create Account
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-12 rounded-full">
                      <FaGoogle className="mr-2" />
                      Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-full">
                      <FaApple className="mr-2" />
                      Continue with Apple
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right side - Image (hidden on mobile) */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="h-full w-full bg-cover bg-center" style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80")'
          }} />
        </div>
      </div>
    </main>
  );
} 
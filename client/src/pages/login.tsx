import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, registerSchema } from "@shared/schema";
import { apiPost } from "@/lib/api";
import { GraduationCap, BookOpen, Users, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { LoginData, RegisterData } from "@shared/schema";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "STUDENT",
      institution: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => apiPost<{ user: any; token: string }>("/api/auth/login", data, { skipAuth: true }),
    onSuccess: (response) => {
      login(response.user, response.token);
      navigate("/dashboard");
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => apiPost<{ user: any; token: string }>("/api/auth/register", data, { skipAuth: true }),
    onSuccess: (response) => {
      login(response.user, response.token);
      navigate("/dashboard");
      toast({
        title: "Account created!",
        description: "Welcome to ShareX. Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2e8f0%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-20 lg:py-12">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">ShareX</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Academic Excellence Platform</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Project Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Create, manage, and showcase your academic projects with professional tools and comprehensive tracking.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Team Collaboration</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Connect with peers, share resources, and collaborate seamlessly across academic projects and research.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Faculty Reviews</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Secure review system with detailed feedback, grading, and professional academic assessment tools.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">ShareX</h1>
            </div>

            {/* Glassmorphism Card */}
            <div className="bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-slate-600 dark:text-slate-400">Access your academic workspace</p>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-lg p-1 mb-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "login"
                        ? "bg-white dark:bg-white/90 text-slate-900 shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                    data-testid="tab-login"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "register"
                        ? "bg-white dark:bg-white/90 text-slate-900 shadow-lg"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                    data-testid="tab-register"
                  >
                    Create Account
                  </button>
                </div>

                {activeTab === "login" && (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="login-email" className="text-slate-700 dark:text-slate-300 font-medium">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          {...loginForm.register("email")}
                          placeholder="student@university.edu"
                          className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                          data-testid="input-login-email"
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-2 font-medium">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="login-password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          {...loginForm.register("password")}
                          placeholder="Enter your password"
                          className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                          data-testid="input-login-password"
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-2 font-medium">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-0 py-3 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                )}

                {activeTab === "register" && (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300 font-medium">First Name</Label>
                          <Input
                            id="firstName"
                            {...registerForm.register("firstName")}
                            placeholder="John"
                            className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                            data-testid="input-firstname"
                          />
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500 mt-2 font-medium">
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300 font-medium">Last Name</Label>
                          <Input
                            id="lastName"
                            {...registerForm.register("lastName")}
                            placeholder="Doe"
                            className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                            data-testid="input-lastname"
                          />
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500 mt-2 font-medium">
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">Username</Label>
                        <Input
                          id="username"
                          {...registerForm.register("username")}
                          placeholder="johndoe"
                          className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                          data-testid="input-username"
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500 mt-2 font-medium">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="register-email" className="text-slate-700 dark:text-slate-300 font-medium">Email Address</Label>
                        <Input
                          id="register-email"
                          type="email"
                          {...registerForm.register("email")}
                          placeholder="john.doe@university.edu"
                          className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                          data-testid="input-register-email"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-2 font-medium">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role" className="text-slate-700 dark:text-slate-300 font-medium">Role</Label>
                          <Select onValueChange={(value) => registerForm.setValue("role", value as any)} defaultValue="STUDENT">
                            <SelectTrigger className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white" data-testid="select-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-white/30 dark:border-white/10">
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="FACULTY">Faculty</SelectItem>
                              <SelectItem value="ADMIN">College Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="institution" className="text-slate-700 dark:text-slate-300 font-medium">Institution</Label>
                          <Input
                            id="institution"
                            {...registerForm.register("institution")}
                            placeholder="University of Tech"
                            className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                            data-testid="input-institution"
                          />
                          {registerForm.formState.errors.institution && (
                            <p className="text-sm text-red-500 mt-2 font-medium">
                              {registerForm.formState.errors.institution.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="register-password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          {...registerForm.register("password")}
                          placeholder="Create a secure password"
                          className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                          data-testid="input-register-password"
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-2 font-medium">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirm-password" className="text-slate-700 dark:text-slate-300 font-medium">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          {...registerForm.register("confirmPassword")}
                          placeholder="Confirm your password"
                          className="mt-2 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-500"
                          data-testid="input-confirm-password"
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-2 font-medium">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-0 py-3 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

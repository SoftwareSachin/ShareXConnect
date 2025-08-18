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
import { GraduationCap, BookOpen, Users, Shield, Mail, Lock, Eye, EyeOff, User, Building2, UserCheck, AtSign, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { LoginData, RegisterData } from "@shared/schema";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2e8f0%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 dark:opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-400/20 dark:from-blue-600/20 dark:to-cyan-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/30 to-pink-400/20 dark:from-purple-600/20 dark:to-pink-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-tr from-pink-500/30 to-rose-400/20 dark:from-pink-600/20 dark:to-rose-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
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

            {/* Main Auth Card */}
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-2xl border border-white/30 dark:border-slate-700/30 rounded-3xl p-10 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Welcome to ShareX</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">Your Academic Excellence Platform</p>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex bg-slate-100/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-1.5 mb-10 border border-slate-200/40 dark:border-slate-600/40">
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className={`flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/50"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-600/30"
                    }`}
                    data-testid="tab-login"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Sign In
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className={`flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-blue-500/10 border border-blue-200/50 dark:border-blue-700/50"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-600/30"
                    }`}
                    data-testid="tab-register"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User className="w-4 h-4" />
                      Create Account
                    </div>
                  </button>
                </div>

                {activeTab === "login" && (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-blue-600" />
                          Email Address
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                          </div>
                          <Input
                            id="login-email"
                            type="email"
                            {...loginForm.register("email")}
                            placeholder="student@university.edu"
                            className="pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-14 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                            data-testid="input-login-email"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-blue-600" />
                          Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                          </div>
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            {...loginForm.register("password")}
                            placeholder="Enter your secure password"
                            className="pl-12 pr-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-14 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                            data-testid="input-login-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 rounded-r-xl transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            ) : (
                              <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            )}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 dark:border-slate-500 rounded-md bg-white/50 dark:bg-slate-700/50"
                          />
                          <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Keep me signed in
                          </label>
                        </div>
                        <div className="text-sm">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
                          >
                            Forgot your password?
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white border-0 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform h-14 text-base" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {loginMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing you in...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5" />
                            Sign In to ShareX
                          </>
                        )}
                      </div>
                    </Button>
                  </form>
                )}

                {activeTab === "register" && (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-slate-800 dark:text-slate-200 font-semibold text-sm">First Name</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <Input
                              id="firstName"
                              {...registerForm.register("firstName")}
                              placeholder="John"
                              className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                              data-testid="input-firstname"
                            />
                          </div>
                          {registerForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {registerForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Last Name</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <Input
                              id="lastName"
                              {...registerForm.register("lastName")}
                              placeholder="Doe"
                              className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                              data-testid="input-lastname"
                            />
                          </div>
                          {registerForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {registerForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-blue-600" />
                          Username
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          </div>
                          <Input
                            id="username"
                            {...registerForm.register("username")}
                            placeholder="johndoe123"
                            className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                            data-testid="input-username"
                          />
                        </div>
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                          <AtSign className="w-4 h-4 text-blue-600" />
                          Email Address
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          </div>
                          <Input
                            id="register-email"
                            type="email"
                            {...registerForm.register("email")}
                            placeholder="student@university.edu"
                            className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                            data-testid="input-register-email"
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Academic Role</Label>
                          <Select onValueChange={(value) => registerForm.setValue("role", value as any)} defaultValue="STUDENT">
                            <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg" data-testid="select-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-300/60 dark:border-slate-600/60 rounded-xl">
                              <SelectItem value="STUDENT" className="font-medium">🎓 Student</SelectItem>
                              <SelectItem value="FACULTY" className="font-medium">👨‍🏫 Faculty</SelectItem>
                              <SelectItem value="ADMIN" className="font-medium">🏛️ College Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="institution" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Institution
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                              <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <Input
                              id="institution"
                              {...registerForm.register("institution")}
                              placeholder="Stanford University"
                              className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                              data-testid="input-institution"
                            />
                          </div>
                          {registerForm.formState.errors.institution && (
                            <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {registerForm.formState.errors.institution.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-blue-600" />
                          Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          </div>
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            {...registerForm.register("password")}
                            placeholder="Create a strong password"
                            className="pl-11 pr-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                            data-testid="input-register-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 rounded-r-xl transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            )}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-blue-600" />
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          </div>
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            {...registerForm.register("confirmPassword")}
                            placeholder="Confirm your password"
                            className="pl-11 pr-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 rounded-r-xl transition-colors duration-200"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                            )}
                          </button>
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white border-0 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform h-14 text-base mt-6" 
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {registerMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating your account...
                          </>
                        ) : (
                          <>
                            <User className="w-5 h-5" />
                            Create ShareX Account
                          </>
                        )}
                      </div>
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

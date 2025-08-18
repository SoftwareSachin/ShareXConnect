import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, BookOpen, Users, Shield, Mail, Lock, Eye, EyeOff, User, Building2, UserCheck, AtSign, KeyRound } from "lucide-react";
import { loginSchema, registerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [, navigate] = useLocation();
  const { login } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captchaVerified: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "STUDENT",
      institution: "",
      captchaVerified: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      loginForm.setError("root", {
        message: error.message || "Login failed. Please check your credentials.",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return await response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      registerForm.setError("root", {
        message: error.message || "Registration failed. Please try again.",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
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
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-16">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">ShareXConnect</h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Academic Excellence Platform</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Project Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Create, organize, and manage academic projects with powerful tools designed for educational excellence.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">ShareXConnect</h1>
            </div>

            {/* Main Auth Card */}
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-2xl border border-white/30 dark:border-slate-700/30 rounded-3xl p-10 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2">Welcome to ShareXConnect</h2>
                <p className="text-slate-600 dark:text-slate-400 text-base font-medium leading-relaxed">Your Academic Excellence Platform</p>
              </div>
              
              <div className="flex bg-slate-100/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-1.5 mb-8 border border-slate-200/40 dark:border-slate-600/40">
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
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    {loginForm.formState.errors.root && (
                      <Alert variant="destructive">
                        <AlertDescription>{loginForm.formState.errors.root.message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                  <Mail className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="student@university.edu"
                                  className="pl-12 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                  disabled={loginMutation.isPending}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                  <Lock className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
                                </div>
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your secure password"
                                  className="pl-12 pr-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                  disabled={loginMutation.isPending}
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 rounded-r-xl transition-colors duration-200"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                                  ) : (
                                    <Eye className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex-shrink-0">
                            <input
                              id="remember-me"
                              name="remember-me"
                              type="checkbox"
                              className="peer h-4 w-4 text-blue-600 bg-white/70 dark:bg-slate-700/70 border-2 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all duration-300 cursor-pointer"
                            />
                            <div className="absolute inset-0 pointer-events-none peer-checked:bg-blue-600 peer-checked:border-blue-600 rounded transition-all duration-300"></div>
                            <svg className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <label htmlFor="remember-me" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none leading-4">
                            Keep me signed in for 7 days
                          </label>
                        </div>
                        <div className="text-sm flex-shrink-0">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-200 underline-offset-4 hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </div>

                      {/* Captcha Verification */}
                      <FormField
                        control={loginForm.control}
                        name="captchaVerified"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center space-x-3 pt-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  data-testid="checkbox-captcha-login"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                                I am not a robot
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] h-14 text-base"
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Signing you in...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <UserCheck className="w-5 h-5" />
                          Sign In to ShareXConnect
                        </div>
                      )}
                    </Button>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-300/60 dark:border-slate-600/60" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-1 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200/50 dark:border-slate-600/50">
                          New to ShareXConnect?
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
                        >
                          Create your account
                        </button>
                      </p>
                    </div>
                  </form>
                </Form>
              )}

              {activeTab === "register" && (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    {registerForm.formState.errors.root && (
                      <Alert variant="destructive">
                        <AlertDescription>{registerForm.formState.errors.root.message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              First Name
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                  disabled={registerMutation.isPending}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                </div>
                                <Input
                                  {...field}
                                  placeholder="Smith"
                                  className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                  disabled={registerMutation.isPending}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                            <AtSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Username
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <AtSign className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <Input
                                {...field}
                                placeholder="johnsmith"
                                className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                disabled={registerMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <Input
                                {...field}
                                type="email"
                                placeholder="john.smith@university.edu"
                                className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                disabled={registerMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Institution
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <Input
                                {...field}
                                placeholder="University of Excellence"
                                className="pl-11 pr-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                disabled={registerMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Academic Role
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={registerMutation.isPending}>
                            <FormControl>
                              <SelectTrigger className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl z-50">
                              <SelectItem value="STUDENT" className="hover:bg-slate-100/70 dark:hover:bg-slate-700/70 rounded-lg cursor-pointer transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-blue-600" />
                                  Student
                                </div>
                              </SelectItem>
                              <SelectItem value="FACULTY" className="hover:bg-slate-100/70 dark:hover:bg-slate-700/70 rounded-lg cursor-pointer transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-green-600" />
                                  Faculty
                                </div>
                              </SelectItem>
                              <SelectItem value="ADMIN" className="hover:bg-slate-100/70 dark:hover:bg-slate-700/70 rounded-lg cursor-pointer transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-purple-600" />
                                  Administrator
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a secure password"
                                className="pl-11 pr-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                disabled={registerMutation.isPending}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 rounded-r-xl transition-colors duration-200"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                                ) : (
                                  <Eye className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center gap-2.5">
                            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <KeyRound className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="pl-11 pr-12 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-300/60 dark:border-slate-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-xl h-12 text-base font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                                disabled={registerMutation.isPending}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 rounded-r-xl transition-colors duration-200"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                                ) : (
                                  <Eye className="h-4.5 w-4.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Captcha Verification */}
                    <FormField
                      control={registerForm.control}
                      name="captchaVerified"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3 pt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                data-testid="checkbox-captcha-register"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                              I am not a robot
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] h-14 text-base"
                      data-testid="button-register-submit"
                    >
                      {registerMutation.isPending ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating account...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <User className="w-5 h-5" />
                          Create ShareXConnect Account
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </form>
                </Form>
              )}

              {/* Professional Footer Branding */}
              <div className="mt-8 pt-6 border-t border-slate-200/30 dark:border-slate-700/30">
                <div className="text-center space-y-2">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    © 2025 ShareXConnect. All rights reserved.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Designed and developed by{" "}
                    <a 
                      href="https://aptivonsolin.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 underline-offset-2 hover:underline"
                    >
                      Aptivon Solution
                    </a>
                    <span className="italic text-slate-400 dark:text-slate-500 ml-1">
                      (Building Trust...)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
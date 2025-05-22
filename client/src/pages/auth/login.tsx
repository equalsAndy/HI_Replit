import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-full max-w-4xl m-auto py-12 px-6">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your account and continue your workshop journey.
          </p>
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
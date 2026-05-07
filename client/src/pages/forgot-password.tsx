import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth0 } from '@auth0/auth0-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const HERO_LOGO = '/landing/Heliotrope-Imaginal-logo.horizongal.black-text.png';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

type Status = 'idle' | 'submitting' | 'success' | 'rate-limited';

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const { loginWithRedirect } = useAuth0();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email.trim() }),
      });

      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body?.error || 'Too many requests. Please try again later.');
        setStatus('rate-limited');
        return;
      }

      // Always treat any non-429 response as success — server intentionally
      // returns 200 regardless of whether the email exists.
      setStatus('success');
    } catch {
      // Network failures should still show success to avoid revealing state.
      setStatus('success');
    }
  };

  const handleBackToLogin = () => {
    const redirectUri =
      (import.meta.env.VITE_AUTH0_REDIRECT_URI as string) ||
      window.location.origin + '/auth/callback';
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: redirectUri,
        prompt: 'login',
        scope: 'openid profile email',
      },
    }).catch(() => navigate('/'));
  };

  const isSubmitting = status === 'submitting';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src={HERO_LOGO}
            alt="Heliotrope Imaginal"
            className="h-12 w-auto"
          />
        </div>

        {status === 'success' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                If an account exists with that email, we've sent a password reset link.
                Check your inbox and spam folder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Back to login
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset your password</CardTitle>
              <CardDescription>
                Enter the email address associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {errorMessage && (
                    <p className="text-sm text-red-600" role="alert">
                      {errorMessage}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

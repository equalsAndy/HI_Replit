import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema for invite code validation
const inviteSchema = z.object({
  inviteCode: z.string()
    .min(12, "Invite code must be 12 characters")
    .max(12, "Invite code must be 12 characters")
    .regex(/^[A-HJ-NP-Z2-9]+$/, "Invalid invite code format"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteVerificationProps {
  onVerified: (inviteData: any) => void;
}

export function InviteVerification({ onVerified }: InviteVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form setup
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  // Submit handler
  const onSubmit = async (data: InviteFormValues) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/invites/verify', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: data.inviteCode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to verify invite code');
      }

      // Pass the invite data to the parent component
      onVerified({
        id: responseData.invite.id,
        inviteCode: data.inviteCode,
        email: responseData.invite.email,
        role: responseData.invite.role,
        name: responseData.invite.name,
      });
    } catch (err) {
      console.error('Invite verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while verifying the invite code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verify Your Invite</CardTitle>
        <CardDescription>
          Enter the invite code you received to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your 12-character code" 
                      {...field}
                      value={field.value.toUpperCase()} 
                      onChange={(e) => {
                        // Only allow uppercase letters and numbers, automatically format
                        const formatted = e.target.value
                          .toUpperCase()
                          .replace(/[^A-HJ-NP-Z2-9]/g, '')
                          .slice(0, 12);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Invite"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
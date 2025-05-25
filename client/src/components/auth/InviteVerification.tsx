import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema for invite code validation
const inviteSchema = z.object({
  inviteCode: z
    .string()
    .min(12, "Invite code must be at least 12 characters")
    .refine(
      (code) => /^[A-Z0-9-]{12,14}$/.test(code),
      "Invite code must be in the format XXXX-XXXX-XXXX"
    ),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteVerificationProps {
  onVerified: (inviteData: any) => void;
}

export function InviteVerification({ onVerified }: InviteVerificationProps) {
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Form setup
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  // Verify invite code mutation
  const verifyInviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      const response = await apiRequest('/api/invites/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify invite code');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        // Pass invite data to parent component
        onVerified(data.invite);
      } else {
        setVerificationError(data.error || 'Invalid invite code');
      }
    },
    onError: (error: Error) => {
      setVerificationError(error.message || 'An error occurred while verifying the invite code');
    },
  });

  // Form submission handler
  function onSubmit(data: InviteFormValues) {
    setVerificationError(null);
    verifyInviteMutation.mutate(data);
  }

  // Format invite code as user types (add hyphens)
  const formatInviteCode = (value: string) => {
    // Remove any existing hyphens
    const code = value.replace(/-/g, '').toUpperCase();
    
    // Add hyphens after every 4 characters
    if (code.length <= 4) {
      return code;
    } else if (code.length <= 8) {
      return `${code.slice(0, 4)}-${code.slice(4)}`;
    } else {
      return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verify Invite Code</CardTitle>
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
                      placeholder="XXXX-XXXX-XXXX"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatInviteCode(e.target.value);
                        field.onChange(formatted);
                      }}
                      className="text-center tracking-wider text-lg uppercase"
                      maxLength={14} // 12 chars + 2 hyphens
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {verificationError && (
              <Alert variant="destructive">
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={verifyInviteMutation.isPending}
            >
              {verifyInviteMutation.isPending ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground text-center">
          If you don't have an invite code, please contact your workshop facilitator or administrator.
        </p>
      </CardFooter>
    </Card>
  );
}
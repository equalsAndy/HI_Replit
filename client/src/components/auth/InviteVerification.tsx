import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';

// Form schema for invite code validation
const inviteFormSchema = z.object({
  inviteCode: z.string()
    .min(12, 'Invite code must be exactly 12 characters')
    .max(12, 'Invite code must be exactly 12 characters')
    .regex(/^[A-Z0-9]+$/, 'Invite code must contain only uppercase letters and numbers')
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteVerificationProps {
  onVerified: (inviteData: { 
    email: string; 
    role: string; 
    name?: string; 
    inviteCode: string;
  }) => void;
}

export const InviteVerification: React.FC<InviteVerificationProps> = ({ onVerified }) => {
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form initialization
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: InviteFormValues) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // Remove any hyphens that might have been entered
      const cleanCode = values.inviteCode.replace(/-/g, '').toUpperCase();
      
      // Verify the invite code with the server
      const response = await apiRequest('/api/invites/verify', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: cleanCode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify invite code');
      }
      
      const data = await response.json();
      
      if (!data.valid) {
        throw new Error(data.error || 'Invalid invite code');
      }
      
      // Pass the verified invite data to the parent component
      onVerified({
        email: data.invite.email,
        role: data.invite.role,
        name: data.invite.name,
        inviteCode: cleanCode
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Join Heliotrope Imaginal Workshops</CardTitle>
        <CardDescription>
          Enter your invite code to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      autoComplete="off"
                      onChange={(e) => {
                        // Format the invite code with hyphens for better readability
                        let value = e.target.value.replace(/-/g, '').toUpperCase();
                        if (value.length > 12) value = value.slice(0, 12);
                        
                        // Add hyphens for display
                        if (value.length > 8) {
                          value = `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8)}`;
                        } else if (value.length > 4) {
                          value = `${value.slice(0, 4)}-${value.slice(4)}`;
                        }
                        
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Continue'}
        </Button>
      </CardFooter>
    </Card>
  );
};
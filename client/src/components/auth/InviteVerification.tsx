import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { formatInviteCode } from '@/lib/utils';

// Validation schema for invite code
const inviteCodeSchema = z.object({
  inviteCode: z
    .string()
    .min(12, 'Invite code must be 12 characters')
    .max(14, 'Invite code must be 12 characters (excluding hyphens)')
    .refine(
      (value) => /^[A-HJ-NP-Z2-9-]{12,14}$/.test(value),
      'Invalid invite code format'
    ),
});

type InviteCodeFormValues = z.infer<typeof inviteCodeSchema>;

interface InviteVerificationProps {
  onVerified?: (inviteData: {
    id: number;
    email: string;
    name: string;
    role: string;
  }) => void;
}

export function InviteVerification({ onVerified }: InviteVerificationProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [verificationState, setVerificationState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [inviteData, setInviteData] = useState<{
    id: number;
    email: string;
    name: string;
    role: string;
  } | null>(null);
  
  // Form for invite code
  const form = useForm<InviteCodeFormValues>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      inviteCode: '',
    },
  });
  
  // Mutation for verifying invite code
  const verifyInviteMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      // Clean the invite code (remove hyphens if any)
      const cleanedCode = inviteCode.replace(/-/g, '');
      
      const response = await apiRequest('POST', '/api/verify-invite', { inviteCode: cleanedCode });
      return response.json();
    },
    onSuccess: (data) => {
      setVerificationState('success');
      setInviteData(data);
      
      // Show success toast
      toast({
        title: 'Invite code verified',
        description: `Welcome, ${data.name}! Please complete your registration.`,
      });
      
      // Call the onVerified callback if provided
      if (onVerified) {
        onVerified(data);
      }
    },
    onError: (error: any) => {
      setVerificationState('error');
      
      // Show error toast
      toast({
        title: 'Invalid invite code',
        description: error.message || 'The invite code you entered is invalid or has expired.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: InviteCodeFormValues) => {
    setVerificationState('verifying');
    verifyInviteMutation.mutate(values.inviteCode);
  };
  
  // Handle invite code input format (add hyphens for readability)
  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // Remove any non-alphanumeric characters except hyphens
    value = value.replace(/[^A-Z0-9-]/g, '');
    
    // Remove existing hyphens first
    const clean = value.replace(/-/g, '');
    
    // If we have a clean code, format it with hyphens
    if (clean.length > 0) {
      // Format with hyphens after every 4 characters
      const formatted = formatInviteCode(clean);
      form.setValue('inviteCode', formatted);
    } else {
      form.setValue('inviteCode', value);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify Invite Code</CardTitle>
        <CardDescription>
          Enter your invite code to continue with registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verificationState === 'success' && inviteData ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Invite Verified</h3>
              <p className="text-muted-foreground">
                Welcome, <span className="font-semibold">{inviteData.name}</span>!
              </p>
              <p className="text-sm text-muted-foreground">
                You've been invited as a <span className="font-medium capitalize">{inviteData.role}</span>
              </p>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => setLocation(`/register?inviteCode=${form.getValues('inviteCode').replace(/-/g, '')}`)}
            >
              Continue to Registration
            </Button>
          </div>
        ) : (
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
                        className="text-center font-mono text-lg tracking-wider"
                        {...field}
                        onChange={handleCodeInput}
                        disabled={verificationState === 'verifying'}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the 12-character code you received in your invitation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={verificationState === 'verifying'}
              >
                {verificationState === 'verifying' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify Invite Code
              </Button>
              
              {verificationState === 'error' && (
                <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                  <XCircle className="h-4 w-4" />
                  <span>Invalid or expired invite code. Please check and try again.</span>
                </div>
              )}
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        <p>
          If you don't have an invite code, please contact your workshop facilitator.
        </p>
      </CardFooter>
    </Card>
  );
}
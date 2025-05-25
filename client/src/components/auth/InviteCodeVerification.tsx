import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Invite code schema
const inviteCodeSchema = z.object({
  inviteCode: z.string()
    .min(12, 'Invite code must be 12 characters')
    .max(12, 'Invite code must be 12 characters')
    .regex(/^[A-Z0-9]{12}$/, 'Invite code must contain only uppercase letters and numbers')
});

type InviteCodeFormValues = z.infer<typeof inviteCodeSchema>;

interface InviteVerificationProps {
  onVerified: (inviteData: {
    inviteCode: string;
    name: string;
    email: string;
    expiresAt: string;
  }) => void;
}

export function InviteCodeVerification({ onVerified }: InviteVerificationProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form definition
  const form = useForm<InviteCodeFormValues>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      inviteCode: ''
    }
  });
  
  // Format invite code as it's typed
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces and convert to uppercase
    let formatted = e.target.value.replace(/\s/g, '').toUpperCase();
    
    // Limit to 12 characters
    if (formatted.length > 12) {
      formatted = formatted.slice(0, 12);
    }
    
    // Replace invalid characters
    formatted = formatted.replace(/[^A-Z0-9]/g, '');
    
    form.setValue('inviteCode', formatted);
  };
  
  // Mutation for verifying invite code
  const verifyInviteMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await apiRequest('POST', '/api/auth/verify-invite', { inviteCode });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: 'Invite code verified',
          description: 'Please complete your profile setup.',
        });
        
        onVerified({
          inviteCode: form.getValues('inviteCode'),
          name: data.invite.name,
          email: data.invite.email,
          expiresAt: data.invite.expiresAt
        });
      }
    },
    onError: (error: any) => {
      console.error('Error verifying invite code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify invite code. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = async (data: InviteCodeFormValues) => {
    setIsSubmitting(true);
    try {
      await verifyInviteMutation.mutateAsync(data.inviteCode);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Enter Invite Code</CardTitle>
        <CardDescription>
          Enter the 12-character invite code you received
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      {...field}
                      placeholder="XXXXXXXXXXXX"
                      className="text-center tracking-wider uppercase"
                      onChange={handleInviteCodeChange}
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    Code is case-insensitive and spaces are ignored
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Code
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          If you don't have an invite code, please contact your administrator or facilitator.
        </div>
      </CardFooter>
    </Card>
  );
}
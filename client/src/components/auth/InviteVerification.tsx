import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the form schema
const inviteFormSchema = z.object({
  inviteCode: z
    .string()
    .min(1, 'Invite code is required')
    .regex(/^[A-Z0-9-]{12,14}$/, 'Invalid invite code format')
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteVerificationProps {
  onVerified: (inviteData: {
    inviteCode: string;
    email: string;
    role: string;
    name?: string;
    jobTitle?: string;
    organization?: string;
  }) => void;
}

const InviteVerification: React.FC<InviteVerificationProps> = ({ onVerified }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      inviteCode: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: InviteFormValues) => {
    setIsVerifying(true);
    
    try {
      // Format the invite code (remove spaces, etc.)
      const formattedCode = data.inviteCode.replace(/\s+/g, '').toUpperCase();
      
      // Verify the invite code with the API
      const response = await fetch(`/api/auth/validate-invite`, {
        method: 'POST',
        body: JSON.stringify({ inviteCode: formattedCode }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Verification failed',
          description: result.error || 'Invalid invite code'
        });
        setIsVerifying(false);
        return;
      }
      
      // Call the onVerified callback with the invite data
      onVerified({
        inviteCode: formattedCode,
        email: result.invite.email,
        role: result.invite.role,
        name: result.invite.name,
        jobTitle: result.invite.jobTitle,
        organization: result.invite.organization
      });
      
      toast({
        title: 'Invite code verified',
        description: 'Your invite code has been successfully verified.'
      });
    } catch (error) {
      console.error('Error verifying invite code:', error);
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: 'There was a problem verifying your invite code. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle auto-formatting of invite code as user types
  const formatInviteCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
    
    // Add hyphens after every 4 characters (if not already there)
    if (value.length > 4 && value.charAt(4) !== '-' && !value.includes('-')) {
      value = value.replace(/(.{4})/g, '$1-');
    }
    
    // Limit to 14 characters (12 chars + 2 hyphens)
    value = value.substring(0, 14);
    
    form.setValue('inviteCode', value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Enter Your Invite Code</CardTitle>
        <CardDescription className="text-center">
          Please enter the invite code you received to create your account.
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
                      onChange={(e) => {
                        field.onChange(e);
                        formatInviteCode(e);
                      }}
                      placeholder="XXXX-XXXX-XXXX"
                      className="text-center tracking-widest uppercase"
                      disabled={isVerifying}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Invite Code'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          If you don't have an invite code, please contact your administrator.
        </p>
      </CardFooter>
    </Card>
  );
};

export default InviteVerification;
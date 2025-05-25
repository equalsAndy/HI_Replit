import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Invite code schema
const inviteCodeSchema = z.object({
  inviteCode: z.string().min(12, {
    message: "Invite code must be at least 12 characters.",
  }),
});

type InviteCodeValues = z.infer<typeof inviteCodeSchema>;

interface InviteVerificationProps {
  onInviteVerified: (invite: any) => void;
}

export function InviteVerification({ onInviteVerified }: InviteVerificationProps) {
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<InviteCodeValues>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  // Verify invite code mutation
  const verifyInviteMutation = useMutation({
    mutationFn: async (data: InviteCodeValues) => {
      const res = await apiRequest('POST', '/api/verify-invite', data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Invalid invite code");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Invite code verified",
        description: `Welcome, ${data.name}!`,
      });
      onInviteVerified(data);
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InviteCodeValues) => {
    verifyInviteMutation.mutate(data);
  };

  // Format invite code as it's typed (uppercase, remove spaces, limit to valid characters)
  const formatInviteCode = (value: string) => {
    // Remove any characters that aren't in our allowed set
    const formatted = value
      .toUpperCase()
      .replace(/[^ABCDEFGHJKMNPQRSTUVWXYZ23456789]/g, '')
      .slice(0, 12); // Limit to 12 characters
    
    return formatted;
  };

  return (
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
                  placeholder="Enter your 12-character invite code" 
                  {...field} 
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(formatInviteCode(e.target.value));
                  }}
                  className="font-mono text-center tracking-wider uppercase"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={verifyInviteMutation.isPending}
        >
          {verifyInviteMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Invite Code"
          )}
        </Button>
      </form>
    </Form>
  );
}
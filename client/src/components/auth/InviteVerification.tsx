import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Schema for invite code validation
const inviteSchema = z.object({
  inviteCode: z
    .string()
    .min(12, "Invite code must be 12 characters")
    .max(12, "Invite code must be 12 characters")
    .refine(
      (value) => /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/.test(value),
      "Invalid invite code format"
    ),
});

type InviteVerificationValues = z.infer<typeof inviteSchema>;

interface InviteVerificationProps {
  onVerified: (inviteData: any) => void;
}

export function InviteVerification({ onVerified }: InviteVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Define form
  const form = useForm<InviteVerificationValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteCode: "",
    },
  });

  // Setup verification mutation
  const verifyInviteMutation = useMutation({
    mutationFn: (values: InviteVerificationValues) =>
      apiRequest("/api/invites/verify", {
        method: "POST",
        data: values,
      }),
    onSuccess: (data) => {
      setIsLoading(false);
      if (data.valid) {
        toast({
          title: "Valid invite code",
          description: "Your invite code has been verified successfully.",
        });
        onVerified(data);
      } else {
        toast({
          title: "Invalid invite code",
          description: data.message || "Please check your invite code and try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Verification failed",
        description: error.message || "Please check your invite code and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: InviteVerificationValues) => {
    setIsLoading(true);
    verifyInviteMutation.mutate(values);
  };

  // Format invite code while typing (removes spaces and converts to uppercase)
  const formatInviteCode = (value: string) => {
    // Remove spaces and convert to uppercase
    return value.replace(/\s+/g, "").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Verify Invite Code</h1>
        <p className="text-muted-foreground">
          Enter your invite code to create your account
        </p>
      </div>

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
                    placeholder="ABCD3456WXYZ"
                    onChange={(e) => {
                      const formatted = formatInviteCode(e.target.value);
                      field.onChange(formatted);
                    }}
                    disabled={isLoading}
                    className="uppercase"
                    maxLength={12}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Please contact your administrator if you don't have an invite code.
        </p>
      </div>
    </div>
  );
}
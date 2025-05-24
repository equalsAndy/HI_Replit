import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function MobileFooterNav() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
    role?: string;
  }>({ queryKey: ['/api/user/profile'] });
  
  // Function to reset user data
  const handleResetUserData = async () => {
    if (!user?.id) return;
    
    try {
      // Show loading toast
      toast({
        title: "Resetting Data",
        description: "Please wait while your data is being reset...",
        variant: "default",
      });
      
      // Use the correct reset endpoint that exists in the code
      const response = await fetch(`/api/test-users/reset/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Reset Successful",
          description: "Your assessment data has been reset. The page will refresh now.",
          variant: "default",
        });
        
        // Invalidate queries to force refetch
        queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
        
        // Force reload to show reset state after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset your data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "An error occurred while resetting user data. Please try again.",
        variant: "destructive",
      });
      console.error("Error resetting user data:", error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 flex justify-between items-center z-50 md:hidden">
      {user?.id && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-md text-white hover:bg-yellow-400"
          onClick={handleResetUserData}
        >
          Reset Data
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-md bg-white text-yellow-600 hover:bg-yellow-100"
        onClick={() => window.location.href = 'mailto:esbin@5x5teams.com'}
      >
        Contact Us
      </Button>
      {user?.id && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-md text-white hover:bg-yellow-400"
          onClick={() => navigate('/logout')}
        >
          Logout
        </Button>
      )}
    </div>
  );
}
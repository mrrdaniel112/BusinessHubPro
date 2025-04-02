import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
          throw new Error('No verification token found');
        }

        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          toast({
            title: "Email Verified",
            description: "Your email has been verified successfully. You can now log in.",
          });
          setLocation('/login');
        } else {
          throw new Error(data.error || 'Verification failed');
        }
      } catch (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
        setLocation('/login');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {verifying ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : null}
    </div>
  );
} 
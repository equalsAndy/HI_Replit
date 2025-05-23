import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

const LoginInstructions: React.FC = () => {
  return (
    <Alert className="mt-4 bg-blue-50">
      <InfoIcon className="h-4 w-4 text-blue-700" />
      <AlertTitle className="font-medium text-blue-700">Test User Accounts</AlertTitle>
      <AlertDescription className="text-blue-800">
        <p className="mt-1">All test accounts use the password <strong>password</strong></p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Admin:</strong> username: admin</li>
          <li><strong>Facilitator:</strong> username: facilitator</li>
          <li><strong>Participant:</strong> username: user1 or user2</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default LoginInstructions;
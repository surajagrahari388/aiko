import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const TipsGeneratingState: React.FC = () => {
  return (
    <Alert className="text-center" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertTitle>Tips are being generated</AlertTitle>
      <AlertDescription>Please wait a few minutes...</AlertDescription>
    </Alert>
  );
};

export default TipsGeneratingState;

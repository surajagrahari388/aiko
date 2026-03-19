import {
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export type QuestionStatus = "pending" | "processing" | "completed" | "error";

export const getStatusIcon = (status: QuestionStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-gray-500" />;
    case "processing":
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const getStatusText = (status: QuestionStatus) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "error":
      return "Error";
    default:
      return "Unknown";
  }
};

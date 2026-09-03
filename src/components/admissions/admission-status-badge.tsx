import React from "react";
import { AdmissionStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

interface AdmissionStatusBadgeProps {
  status: AdmissionStatus;
  className?: string;
}

export function AdmissionStatusBadge({ status, className }: AdmissionStatusBadgeProps) {
  switch (status) {
    case "NEW":
      return (
        <Badge variant="info" className={className}>
          New Lead
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge variant="purple" className={className}>
          Under Review
        </Badge>
      );
    case "INTERVIEW_SCHEDULED":
      return (
        <Badge variant="warning" className={className}>
          Interview Scheduled
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="success" className={className}>
          Approved
        </Badge>
      );
    case "WAITLISTED":
      return (
        <Badge variant="secondary" className={className}>
          Waitlisted
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className={className}>
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline" className={className}>{status}</Badge>;
  }
}

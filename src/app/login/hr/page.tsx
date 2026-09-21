"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { getPortalBySlug } from "@/lib/auth/roles";

export default function HrLoginPage() {
  const portal = getPortalBySlug("hr")!;
  return <PortalLoginForm portal={portal} />;
}

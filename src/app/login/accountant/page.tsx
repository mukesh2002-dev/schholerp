"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { getPortalBySlug } from "@/lib/auth/roles";

export default function AccountantLoginPage() {
  const portal = getPortalBySlug("accountant")!;
  return <PortalLoginForm portal={portal} />;
}

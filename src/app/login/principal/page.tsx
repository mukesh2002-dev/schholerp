"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { getPortalBySlug } from "@/lib/auth/roles";

export default function PrincipalLoginPage() {
  const portal = getPortalBySlug("principal")!;
  return <PortalLoginForm portal={portal} />;
}

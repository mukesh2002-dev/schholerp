"use client";

import { PortalLoginForm } from "@/components/auth/portal-login-form";
import { getPortalBySlug } from "@/lib/auth/roles";

export default function AdminLoginPage() {
  const portal = getPortalBySlug("admin")!;
  return <PortalLoginForm portal={portal} />;
}

"use client";

import { HeadForm } from "@/sections/fees/forms/head-form";

export function HeadEdit({ uuid }: { uuid: string }) {
  return <HeadForm uuid={uuid} />;
}
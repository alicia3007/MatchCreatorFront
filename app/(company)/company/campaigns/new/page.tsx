"use client";

import { Suspense } from "react";
import CreateCampaign from "@/app/pages/CreateCampaign";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateCampaign />
    </Suspense>
  );
}
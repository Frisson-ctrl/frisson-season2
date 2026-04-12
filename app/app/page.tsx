"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /songs since the app page is no longer a hub
    router.push("/songs");
  }, [router]);

  return null;
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import API_BASE from "@/lib/endpoint";

async function logoutRequest() {
  const res = await fetch(`${API_BASE}/users/logout`, {
    method: "POST",
    credentials: "include",
  });

  return { ok: res.ok, status: res.status };
}

export function ButtonLogout() {
  const router = useRouter();

  const onLogout = async () => {
    console.log("Logout init"); // should appear in *browser* console
    const logout = await logoutRequest();
    console.log("Logout end:", logout); // should also be in browser console

    if (logout.ok) {
      router.refresh();
      // or router.replace("/ingresar");
    }
  };

  return (
    <Button onClick={onLogout} variant="outline" className="px-2!">
      Cerrar sesión
    </Button>
  );
}
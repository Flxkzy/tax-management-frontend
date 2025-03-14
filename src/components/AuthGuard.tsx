"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";

interface Props {
  children: React.ReactNode;
}

const AuthGuard: React.FC<Props> = ({ children }) => {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token && pathname !== "/login") {
      router.push("/login"); // Redirect if not logged in
    }
    if (token && pathname === "/login") {
      router.push("/dashboard"); // Redirect logged-in users away from login page
    }
  }, [token, pathname, router]);

  if (!token && pathname !== "/login") {
    return null; // Prevents flickering while checking authentication
  }

  return <>{children}</>;
};

export default AuthGuard;

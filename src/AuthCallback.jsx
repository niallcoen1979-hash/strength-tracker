/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { supabase } from "./supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        window.location.replace("/");
      } else {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }
        window.location.replace("/");
      }
    };
    handleCallback();
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", color:"#6b7280", fontSize:14 }}>
      Signing you in…
    </div>
  );
}
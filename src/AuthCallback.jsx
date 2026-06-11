import { useEffect } from "react";
import { supabase } from "./supabase";

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.getSession().then(() => {
      window.location.href = "/";
    });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", color:"#6b7280", fontSize:14 }}>
      Signing you in…
    </div>
  );
}
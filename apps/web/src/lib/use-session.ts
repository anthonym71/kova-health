"use client";
import { useEffect, useState } from "react";
import { isLive, supabase } from "./supabase";

export type SessionState =
  | { status: "loading" }
  | { status: "demo" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string; displayName: string; role: string };

/** Client-side session/profile state. In demo mode (no Supabase env) always "demo". */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading" });
  useEffect(() => {
    if (!isLive || !supabase) {
      setState({ status: "demo" });
      return;
    }
    let active = true;
    async function load() {
      const { data } = await supabase!.auth.getSession();
      if (!active) return;
      const session = data.session;
      if (!session) {
        setState({ status: "signed-out" });
        return;
      }
      const { data: profile } = await supabase!
        .from("profiles")
        .select("display_name, role")
        .eq("id", session.user.id)
        .single();
      if (!active) return;
      setState({
        status: "signed-in",
        userId: session.user.id,
        displayName: profile?.display_name ?? session.user.email ?? "you",
        role: profile?.role ?? "patient",
      });
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}

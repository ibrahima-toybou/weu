import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="accueil" />
      <Stack.Screen name="pointage" />
      <Stack.Screen name="paiement" />
      <Stack.Screen name="historique" />
    </Stack>
  );
}

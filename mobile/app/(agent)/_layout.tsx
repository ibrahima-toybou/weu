import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export default function AgentLayout() {
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e0eaf5",
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: "#1a5c99",
        tabBarInactiveTintColor: "#7a9c8a",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="accueil"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="tournee"
        options={{
          title: "Tournée",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🚛</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: "Historique",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}

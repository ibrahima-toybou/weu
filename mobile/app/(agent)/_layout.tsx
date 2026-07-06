import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export default function AgentLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTopColor: "rgba(15,23,42,0.06)",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 84 : 64,
        },
        tabBarActiveTintColor: "#0E9384",
        tabBarInactiveTintColor: "#9AA0B0",
        tabBarLabelStyle: {
          fontFamily: "InstrumentSans_600SemiBold",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="accueil"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tournee"
        options={{
          title: "Tournée",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "car" : "car-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: "Historique",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

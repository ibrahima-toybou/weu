import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e0f0e8",
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: "#1a8f69",
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
        name="paiement"
        options={{
          title: "Paiement",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>💳</Text>
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

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import TabNavigator from "./TabNavigator";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><ActivityIndicator size="large" /></View>;
  }
  if (user) return <TabNavigator />;

  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

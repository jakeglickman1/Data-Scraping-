import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "../store/useAuthStore";
import { WelcomeScreen } from "../screens/auth/WelcomeScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { MapScreen } from "../screens/map/MapScreen";
import { TripsScreen } from "../screens/trips/TripsScreen";
import { TripDetailsScreen } from "../screens/trips/TripDetailsScreen";
import { PlanTripScreen } from "../screens/trips/PlanTripScreen";
import { WishlistScreen } from "../screens/wishlist/WishlistScreen";
import { AdvisorScreen } from "../screens/advisor/AdvisorScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { palette } from "../theme/colors";

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  TripDetails: { tripId: string };
  PlanTrip: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Trips: undefined;
  Wishlist: undefined;
  Advisor: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<MainTabParamList>();

const iconForTab = (routeName: keyof MainTabParamList) => {
  switch (routeName) {
    case "Map":
      return "map";
    case "Trips":
      return "briefcase";
    case "Wishlist":
      return "check-square";
    case "Advisor":
      return "compass";
    case "Profile":
      return "user";
    default:
      return "circle";
  }
};

const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: palette.primary,
      tabBarIcon: ({ color, size }) => (
        <Feather name={iconForTab(route.name as keyof MainTabParamList)} size={size} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Trips" component={TripsScreen} />
    <Tab.Screen name="Wishlist" component={WishlistScreen} />
    <Tab.Screen name="Advisor" component={AdvisorScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const token = useAuthStore((state) => state.token);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
      ) : (
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen
            name="TripDetails"
            component={TripDetailsScreen}
            options={{ headerShown: true, title: "Trip Details" }}
          />
          <RootStack.Screen
            name="PlanTrip"
            component={PlanTripScreen}
            options={{ headerShown: true, title: "Plan Trip" }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
};

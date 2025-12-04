import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { palette } from "./src/theme/colors";

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    secondary: palette.secondary,
    surface: palette.surface,
    background: palette.background,
  },
};

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

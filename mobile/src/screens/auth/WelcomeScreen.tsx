import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { PrimaryButton } from "../../components/PrimaryButton";
import { palette } from "../../theme/colors";

type Props = NativeStackScreenProps<any>;

export const WelcomeScreen = ({ navigation }: Props) => {
  return (
    <ScreenWrapper>
      <View style={styles.hero}>
        <Image
          source={require("../../../assets/adaptive-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Travel Companion</Text>
        <Text style={styles.subtitle}>
          Plan smarter trips, visualize adventures, and get curated advice every time you explore.
        </Text>
      </View>
      <PrimaryButton label="Log in" onPress={() => navigation.navigate("Login")} />
      <PrimaryButton
        label="Create an account"
        onPress={() => navigation.navigate("SignUp")}
        mode="outlined"
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 16,
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: palette.text,
  },
  subtitle: {
    fontSize: 16,
    color: palette.muted,
    textAlign: "center",
  },
});

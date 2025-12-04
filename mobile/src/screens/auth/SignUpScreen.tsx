import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { PrimaryButton } from "../../components/PrimaryButton";
import { authService } from "../../services/travelmateApi";
import { useAuthStore } from "../../store/useAuthStore";

type Props = NativeStackScreenProps<any>;

export const SignUpScreen = ({ navigation }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const handleSignUp = async () => {
    try {
      setError(undefined);
      setLoading(true);
      const data = await authService.signup({ email, password, name });
      await setCredentials(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Text style={styles.header}>Create account</Text>
      <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton
        label={loading ? "Creating..." : "Sign up"}
        onPress={handleSignUp}
        disabled={loading}
      />
      <PrimaryButton
        label="Already joined? Log in"
        onPress={() => navigation.navigate("Login")}
        mode="text"
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: "tomato",
    marginBottom: 12,
  },
});

import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { palette } from "../theme/colors";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  mode?: "contained" | "outlined" | "text";
}

export const PrimaryButton = ({
  label,
  onPress,
  disabled,
  mode = "contained",
}: Props) => (
  <Button
    mode={mode}
    onPress={onPress}
    disabled={disabled}
    buttonColor={mode === "contained" ? palette.primary : undefined}
    textColor={mode === "contained" ? "#fff" : palette.primary}
    style={styles.button}
    contentStyle={styles.content}
  >
    {label}
  </Button>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  content: {
    paddingVertical: 6,
  },
});

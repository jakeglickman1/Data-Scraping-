import { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

interface ScreenWrapperProps extends PropsWithChildren {
  scrollable?: boolean;
  backgroundColor?: string;
}

export const ScreenWrapper = ({
  children,
  scrollable = true,
  backgroundColor = "#F5F7FA",
}: ScreenWrapperProps) => {
  const Container = scrollable ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <Container
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={scrollable ? styles.content : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
});

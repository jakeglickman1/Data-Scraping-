import { StyleSheet, Text, View } from "react-native";
import { Avatar, Card } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { useDataStore } from "../../store/useDataStore";
import { PrimaryButton } from "../../components/PrimaryButton";

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { trips, wishlist } = useDataStore();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.header}>
          <Avatar.Text label={user?.email?.[0]?.toUpperCase() ?? "U"} size={64} />
          <View>
            <Text style={styles.name}>{user?.name ?? "Traveler"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{wishlist.length}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
        </Card.Content>
      </Card>
      <PrimaryButton label="Log out" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  email: {
    color: "#6B7280",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: "#6B7280",
  },
});

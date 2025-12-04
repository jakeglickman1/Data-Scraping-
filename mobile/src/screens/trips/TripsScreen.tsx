import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { Card, ActivityIndicator, FAB } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatRange } from "../../utils/date";
import { tripService } from "../../services/travelmateApi";
import { useDataStore } from "../../store/useDataStore";
import { Trip } from "../../types/api";

export const TripsScreen = () => {
  const navigation = useNavigation<any>();
  const { trips, setTrips } = useDataStore();
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.list();
      setTrips(data);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  }, [setTrips]);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  useEffect(() => {
    if (!trips.length) {
      loadTrips();
    } else {
      setLoading(false);
    }
  }, [loadTrips, trips.length]);

  const now = new Date();
  const upcoming = trips.filter((trip) => new Date(trip.endDate) >= now);
  const past = trips.filter((trip) => new Date(trip.endDate) < now);

  const renderTrip = ({ item }: { item: Trip }) => (
    <Card style={styles.card} onPress={() => navigation.navigate("TripDetails" as never, { tripId: item.id } as never)}>
      <Card.Title title={item.destination} subtitle={item.country} />
      <Card.Content>
        <Text style={styles.dates}>{formatRange(item.startDate, item.endDate)}</Text>
        {item.highlights?.[0]?.photos?.[0] && (
          <Card.Cover source={{ uri: item.highlights[0].photos[0] }} style={styles.cover} />
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Upcoming</Text>
      <FlatList data={upcoming} keyExtractor={(item) => item.id} renderItem={renderTrip} ListEmptyComponent={<Text style={styles.empty}>No trips yet. Plan one!</Text>} />
      <Text style={styles.sectionLabel}>Past</Text>
      <FlatList data={past} keyExtractor={(item) => item.id} renderItem={renderTrip} />
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("PlanTrip" as never)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  cover: {
    marginTop: 8,
    height: 120,
  },
  dates: {
    color: "#4B5563",
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  empty: {
    color: "#9CA3AF",
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
});

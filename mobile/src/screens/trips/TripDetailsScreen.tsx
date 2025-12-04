import { useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { Chip } from "react-native-paper";
import { tripService } from "../../services/travelmateApi";
import { Trip } from "../../types/api";
import { formatRange } from "../../utils/date";

type TripDetailsRoute = RouteProp<{ params: { tripId: string } }, "params">;

export const TripDetailsScreen = () => {
  const route = useRoute<TripDetailsRoute>();
  const [trip, setTrip] = useState<Trip>();

  useEffect(() => {
    const load = async () => {
      const data = await tripService.get(route.params.tripId);
      setTrip(data);
    };
    load();
  }, [route.params.tripId]);

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text>Loading trip...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{trip.destination}</Text>
      <Text style={styles.subtitle}>{trip.country}</Text>
      <Text style={styles.dates}>{formatRange(trip.startDate, trip.endDate)}</Text>
      <Text style={styles.section}>Highlights</Text>
      {trip.highlights?.length ? (
        trip.highlights.map((highlight) => (
          <View key={highlight.id} style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>{highlight.title}</Text>
            {highlight.photos?.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {highlight.photos.map((photo) => (
                  <Image key={photo} source={{ uri: photo }} style={styles.photo} />
                ))}
              </ScrollView>
            ) : null}
            {highlight.caption && <Text style={styles.caption}>{highlight.caption}</Text>}
            <Chip style={styles.chip}>
              {highlight.occurredAt ? new Date(highlight.occurredAt).toDateString() : "Memorable moment"}
            </Chip>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No highlights yet.</Text>
      )}
      <Text style={styles.section}>Visited places</Text>
      {trip.visitedPlaces?.map((place) => (
        <View key={place.id} style={styles.placeCard}>
          <Text style={styles.placeTitle}>{place.name}</Text>
          <Text style={styles.placeSubtitle}>
            {place.city}, {place.country}
          </Text>
          {place.caption && <Text style={styles.caption}>{place.caption}</Text>}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
  },
  dates: {
    marginBottom: 16,
    color: "#4B5563",
  },
  section: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  highlightCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    elevation: 2,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  caption: {
    color: "#6B7280",
  },
  chip: {
    alignSelf: "flex-start",
  },
  photoRow: {
    flexDirection: "row",
  },
  photo: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  empty: {
    color: "#9CA3AF",
  },
  placeCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginBottom: 8,
  },
  placeTitle: {
    fontWeight: "600",
  },
  placeSubtitle: {
    color: "#6B7280",
  },
});

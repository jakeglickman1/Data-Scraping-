import { useEffect, useMemo, useState } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { StyleSheet, Text, View } from "react-native";
import { Chip, ActivityIndicator, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { useDataStore } from "../../store/useDataStore";
import { placeService, tripService } from "../../services/travelmateApi";
import { VisitedPlace } from "../../types/api";
import { formatDay } from "../../utils/date";

const defaultRegion: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

export const MapScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<VisitedPlace>();
  const [filterTripId, setFilterTripId] = useState<string>("all");
  const { trips, setTrips, visitedPlaces, setVisitedPlaces } = useDataStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripList, places] = await Promise.all([tripService.list(), placeService.visited()]);
        setTrips(tripList);
        setVisitedPlaces(places);
      } catch (error) {
        console.warn(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setTrips, setVisitedPlaces]);

  const filteredPlaces = useMemo(() => {
    if (filterTripId === "all") {
      return visitedPlaces;
    }
    return visitedPlaces.filter((place) => place.tripId === filterTripId);
  }, [filterTripId, visitedPlaces]);

  const region: Region =
    filteredPlaces.length > 0
      ? {
          latitude: filteredPlaces[0].latitude,
          longitude: filteredPlaces[0].longitude,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }
      : defaultRegion;

  if (loading) {
    return (
      <ScreenWrapper scrollable={false}>
        <ActivityIndicator animating />
      </ScreenWrapper>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipRow}>
        <Chip
          selected={filterTripId === "all"}
          onPress={() => setFilterTripId("all")}
          style={styles.chip}
        >
          All trips
        </Chip>
        {trips.map((trip) => (
          <Chip
            key={trip.id}
            selected={filterTripId === trip.id}
            onPress={() => setFilterTripId(trip.id)}
            style={styles.chip}
          >
            {trip.destination}
          </Chip>
        ))}
      </View>
      <MapView style={styles.map} initialRegion={region}>
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.city}
            onPress={() => setSelectedPlace(place)}
          />
        ))}
      </MapView>
      {selectedPlace && (
        <Card
          style={styles.card}
          onPress={() =>
            selectedPlace.tripId &&
            navigation.navigate("TripDetails" as never, { tripId: selectedPlace.tripId } as never)
          }
        >
          <Card.Title title={selectedPlace.name} subtitle={`${selectedPlace.city}, ${selectedPlace.country}`} />
          <Card.Content>
            <Text style={styles.caption}>{selectedPlace.caption}</Text>
            {selectedPlace.visitDate && <Text style={styles.date}>{formatDay(selectedPlace.visitDate)}</Text>}
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  chipRow: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  card: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
  },
  caption: {
    color: "#4b5563",
  },
  date: {
    marginTop: 4,
    color: "#6b7280",
  },
});

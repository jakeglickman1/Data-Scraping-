import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, TextInput, Chip } from "react-native-paper";
import { advisorService } from "../../services/travelmateApi";
import { AdvisorResponse } from "../../types/api";
import { PrimaryButton } from "../../components/PrimaryButton";

const stayTypes = ["Budget", "Mid-range", "Luxury", "Hostel", "Resort", "Apartment"];

export const AdvisorScreen = () => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [stayType, setStayType] = useState<string>();
  const [recommendations, setRecommendations] = useState<AdvisorResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const searchAdvisor = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await advisorService.search({
        destination,
        startDate,
        endDate,
        travelers: Number(travelers),
        stayType,
      });
      setRecommendations(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput label="Destination" value={destination} onChangeText={setDestination} style={styles.input} />
      <TextInput label="Start date" value={startDate} onChangeText={setStartDate} style={styles.input} />
      <TextInput label="End date" value={endDate} onChangeText={setEndDate} style={styles.input} />
      <TextInput
        label="Travelers"
        value={travelers}
        onChangeText={setTravelers}
        keyboardType="number-pad"
        style={styles.input}
      />
      <View style={styles.tags}>
        {stayTypes.map((type) => (
          <Chip
            key={type}
            selected={stayType === type}
            onPress={() => setStayType(type)}
            style={styles.chip}
          >
            {type}
          </Chip>
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton
        label={loading ? "Searching..." : "Search advisor"}
        onPress={searchAdvisor}
        disabled={loading || !destination || !startDate || !endDate}
      />
      {recommendations && (
        <View style={styles.results}>
          <Text style={styles.section}>Recommended flights</Text>
          {recommendations.flights.map((flight) => (
            <Card key={flight.id} style={styles.card}>
              <Card.Title title={`${flight.from} → ${flight.to}`} subtitle={flight.airline} />
              <Card.Content>
                <Text>
                  {new Date(flight.departure).toLocaleString()} · {flight.durationHours} hrs
                </Text>
                <Text style={styles.price}>${flight.price.toFixed(0)}</Text>
              </Card.Content>
            </Card>
          ))}
          <Text style={styles.section}>Places to stay</Text>
          {recommendations.hotels.map((hotel) => (
            <Card key={hotel.id} style={styles.card}>
              <Card.Title title={hotel.name} subtitle={hotel.neighborhood} />
              <Card.Content>
                <Text>
                  Rating {hotel.rating} · ${hotel.pricePerNight}/night
                </Text>
                <Text style={styles.price}>${hotel.totalPrice.toFixed(0)} total</Text>
              </Card.Content>
            </Card>
          ))}
          <Text style={styles.section}>Advisor notes</Text>
          {recommendations.notes.map((note, index) => (
            <Text key={index} style={styles.note}>
              • {note}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  input: {
    marginBottom: 6,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 20,
  },
  error: {
    color: "tomato",
  },
  results: {
    marginTop: 12,
    gap: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
  },
  price: {
    marginTop: 6,
    fontWeight: "600",
  },
  note: {
    color: "#4B5563",
  },
});

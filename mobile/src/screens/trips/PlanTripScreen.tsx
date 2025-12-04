import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip, TextInput, Card } from "react-native-paper";
import { plannerService } from "../../services/travelmateApi";
import { PlannerResponse } from "../../types/api";
import { PrimaryButton } from "../../components/PrimaryButton";

const interestOptions = ["Food", "Museums", "Nightlife", "Nature", "Family", "Beaches"];

export const PlanTripScreen = () => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [result, setResult] = useState<PlannerResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const requestPlan = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await plannerService.recommend({
        destination,
        startDate,
        endDate,
        interests,
      });
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        label="Destination city"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />
      <TextInput
        label="Start date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        style={styles.input}
      />
      <TextInput label="End date" value={endDate} onChangeText={setEndDate} style={styles.input} />
      <View style={styles.interests}>
        {interestOptions.map((option) => (
          <Chip
            key={option}
            selected={interests.includes(option)}
            onPress={() => toggleInterest(option)}
            style={styles.chip}
          >
            {option}
          </Chip>
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton
        label={loading ? "Loading..." : "Get recommendations"}
        onPress={requestPlan}
        disabled={loading || !destination || !startDate || !endDate}
      />
      {result && (
        <View style={styles.results}>
          <Text style={styles.section}>
            Suggested activities ({result.lengthOfStay} day stay)
          </Text>
          {result.activities.map((activity) => (
            <Card key={activity.id} style={styles.card}>
              <Card.Title title={activity.name} subtitle={activity.category} />
              <Card.Content>
                <Text>{activity.description}</Text>
                <Text style={styles.meta}>
                  {activity.durationHours} hrs · {activity.latitude.toFixed(2)},{" "}
                  {activity.longitude.toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
          ))}
          <Text style={styles.section}>Events</Text>
          {result.events.map((event) => (
            <Card key={event.id} style={styles.card}>
              <Card.Title title={event.name} subtitle={event.venue} />
              <Card.Content>
                <Text>{new Date(event.date).toLocaleString()}</Text>
                {event.link && <Text style={styles.link}>{event.link}</Text>}
              </Card.Content>
            </Card>
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
    marginBottom: 8,
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 20,
  },
  error: {
    color: "tomato",
  },
  results: {
    marginTop: 16,
    gap: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
  },
  meta: {
    marginTop: 6,
    color: "#6B7280",
  },
  link: {
    color: "#0F9D8A",
    marginTop: 4,
  },
});

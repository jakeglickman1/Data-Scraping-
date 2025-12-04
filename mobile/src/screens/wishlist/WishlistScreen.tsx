import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Card, Checkbox, TextInput, Chip, IconButton } from "react-native-paper";
import { wishlistService } from "../../services/travelmateApi";
import { useDataStore } from "../../store/useDataStore";
import { PrimaryButton } from "../../components/PrimaryButton";
import { WishlistItem } from "../../types/api";

const tagOptions = ["Beach", "City", "Hiking", "Food", "Culture"];

export const WishlistScreen = () => {
  const { wishlist, setWishlist } = useDataStore();
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      const items = await wishlistService.list();
      setWishlist(items);
    };
    loadItems();
  }, [setWishlist]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const addDestination = async () => {
    try {
      setLoading(true);
      const item = await wishlistService.create({
        destination,
        country,
        tags: selectedTags,
      });
      setWishlist([item, ...wishlist]);
      setDestination("");
      setCountry("");
      setSelectedTags([]);
    } catch (error) {
      Alert.alert("Could not add destination", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisited = async (item: WishlistItem) => {
    const updated = await wishlistService.update(item.id, { visited: !item.visited });
    setWishlist(wishlist.map((entry) => (entry.id === item.id ? updated : entry)));
  };

  const removeItem = (item: WishlistItem) => {
    Alert.alert("Remove destination?", item.destination, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await wishlistService.remove(item.id);
          setWishlist(wishlist.filter((entry) => entry.id !== item.id));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TextInput label="Destination" value={destination} onChangeText={setDestination} style={styles.input} />
      <TextInput label="Country" value={country} onChangeText={setCountry} style={styles.input} />
      <View style={styles.tags}>
        {tagOptions.map((tag) => (
          <Chip key={tag} selected={selectedTags.includes(tag)} onPress={() => toggleTag(tag)} style={styles.chip}>
            {tag}
          </Chip>
        ))}
      </View>
      <PrimaryButton
        label="Add to wishlist"
        onPress={addDestination}
        disabled={!destination || loading}
      />
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.destination}
              subtitle={item.country}
              left={(props) => (
                <Checkbox
                  status={item.visited ? "checked" : "unchecked"}
                  onPress={() => toggleVisited(item)}
                  {...props}
                />
              )}
              right={(props) => <IconButton icon="delete" onPress={() => removeItem(item)} {...props} />}
            />
            <Card.Content>
              <View style={styles.tagRow}>
                {item.tags?.map((tag) => (
                  <Chip key={tag} style={styles.smallChip}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 10,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 18,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  list: {
    marginTop: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  smallChip: {
    height: 28,
  },
});

import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { api, imageUrl } from "../api";
import { Button, colors } from "../ui";

export default function HomeScreen({ navigation }) {
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    api.samples()
      .then((rows) => { if (active) setSamples(rows); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []));

  return (
    <View style={styles.screen}>
      <View style={styles.actions}>
        <Button label="Photograph soil" onPress={() => navigation.navigate("Capture")} />
        <Pressable onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.link}>Profile</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={samples}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No soil photos sent yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: imageUrl(item.image_url) }} style={styles.photo} />
            <View style={styles.cardBody}>
              <Text style={styles.place}>{item.place}</Text>
              {item.crop ? <Text style={styles.meta}>{item.crop}</Text> : null}
              {item.notes ? <Text style={styles.meta}>{item.notes}</Text> : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  actions: { gap: 12, padding: 24, paddingBottom: 8 },
  link: { color: colors.ink, fontSize: 15, textAlign: "center", textDecorationLine: "underline" },
  error: { color: colors.danger, paddingHorizontal: 24 },
  list: { gap: 12, padding: 24 },
  empty: { color: colors.muted, fontSize: 15 },
  card: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, flexDirection: "row" },
  photo: { backgroundColor: colors.line, height: 88, width: 88 },
  cardBody: { flex: 1, gap: 4, padding: 12 },
  place: { color: colors.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 14 },
});

import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { api } from "../api";
import { Button, colors, ErrorText, Field } from "../ui";

export default function CaptureScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [place, setPlace] = useState("");
  const [crop, setCrop] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is required to photograph the soil.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  }

  async function submit() {
    if (!photo) {
      setError("Take a soil photo first.");
      return;
    }
    if (!place.trim()) {
      setError("Enter the place where this soil is.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("place", place.trim());
      body.append("crop", crop.trim());
      body.append("notes", notes.trim());
      body.append("photo", {
        uri: photo.uri,
        name: "soil.jpg",
        type: photo.mimeType || "image/jpeg",
      });
      await api.createSample(body);
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {photo ? <Image source={{ uri: photo.uri }} style={styles.preview} /> : null}
      <Button label={photo ? "Retake photo" : "Take photo"} onPress={takePhoto} />
      <Field label="Place" value={place} onChangeText={setPlace} placeholder="Village, upazila" />
      <Field label="Crop" value={crop} onChangeText={setCrop} placeholder="Rice, jute, vegetables" />
      <Field
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Soil color, moisture, or anything else"
        multiline
      />
      <ErrorText>{error}</ErrorText>
      <Button label={busy ? "Sending..." : "Send to server"} onPress={submit} disabled={busy} />
      <Text style={styles.hint}>The photo and these details are saved to your account.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 14, padding: 24 },
  preview: { backgroundColor: colors.line, height: 220, width: "100%" },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20 },
});

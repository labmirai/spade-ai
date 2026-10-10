import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth";
import { Button, colors, ErrorText, Field } from "../ui";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>SPADE-AI</Text>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.copy}>Photograph soil and send it to the research server.</Text>
      <Field
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <ErrorText>{error}</ErrorText>
      <Button label={busy ? "Signing in..." : "Sign in"} onPress={submit} disabled={busy} />
      <Pressable onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Create an account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 14, justifyContent: "center", padding: 24 },
  kicker: { color: colors.green, fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },
  title: { color: colors.ink, fontSize: 32, fontWeight: "700" },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 22, marginBottom: 8 },
  link: { color: colors.ink, fontSize: 15, textAlign: "center", textDecorationLine: "underline" },
});

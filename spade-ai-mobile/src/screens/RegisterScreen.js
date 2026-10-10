import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { useAuth } from "../auth";
import { Button, ErrorText, Field } from "../ui";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (password.length < 6) {
      setError("Use at least 6 characters for the password.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Field label="Name" value={name} onChangeText={setName} />
      <Field
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Field label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <ErrorText>{error}</ErrorText>
      <Button label={busy ? "Creating account..." : "Create account"} onPress={submit} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 14, padding: 24 },
});

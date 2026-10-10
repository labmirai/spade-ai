import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export const colors = {
  background: "#f4f1ea",
  ink: "#1c1917",
  muted: "#57534e",
  line: "#d6d3d1",
  green: "#3f6212",
  white: "#ffffff",
  danger: "#9f1239",
};

export function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#a8a29e"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Button({ label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.green,
    paddingVertical: 14,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonLabel: { color: colors.white, fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 14 },
});

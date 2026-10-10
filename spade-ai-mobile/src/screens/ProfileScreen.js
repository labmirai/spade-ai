import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth";
import { Button, colors } from "../ui";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.meta}>{user?.email}</Text>
      {user?.phone ? <Text style={styles.meta}>{user.phone}</Text> : null}
      <Button label="Sign out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, gap: 10, padding: 24 },
  name: { color: colors.ink, fontSize: 28, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 16 },
});

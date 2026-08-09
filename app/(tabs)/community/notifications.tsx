import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import type { AppNotification, Profile } from "@/lib/database.types";
import { fetchNotifications, markAllRead } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { colors, radius, spacing } from "@/lib/theme";

const messageFor = (n: AppNotification, actorName: string) => {
  switch (n.type) {
    case "follow":
      return `@${actorName} vous suit désormais.`;
    case "new_mod_entry":
      return `@${actorName} a ajouté une nouvelle modification.`;
    case "like":
      return `@${actorName} a aimé votre publication.`;
    case "comment":
      return `@${actorName} a commenté votre publication.`;
    default:
      return "Nouvelle notification.";
  }
};

export default function NotificationsScreen() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [actors, setActors] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    const list = await fetchNotifications(session.user.id);
    setNotifications(list);

    const actorIds = [...new Set(list.map((n) => n.actor_id).filter((id): id is string => !!id))];
    if (actorIds.length > 0) {
      const { data } = await supabase.from("profiles").select("*").in("id", actorIds);
      const map: Record<string, Profile> = {};
      (data ?? []).forEach((p) => (map[p.id] = p));
      setActors(map);
    }

    await markAllRead(session.user.id);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  return (
    <Screen>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const actorName = item.actor_id ? actors[item.actor_id]?.username ?? "quelqu'un" : "quelqu'un";
          return (
            <View style={[styles.item, !item.read && styles.itemUnread]}>
              <Ionicons name="notifications" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{messageFor(item, actorName)}</Text>
                <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleString("fr-FR")}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Aucune notification pour l'instant.</Text>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  itemUnread: {
    borderColor: colors.primary,
  },
  itemText: {
    color: colors.text,
    fontSize: 14,
  },
  itemDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textMuted,
  },
});

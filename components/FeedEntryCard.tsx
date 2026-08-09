import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import type { FeedItem } from "@/lib/social";
import { fetchLikeCount, hasLiked, like, unlike } from "@/lib/social";
import { categoryLabels, colors, radius, spacing } from "@/lib/theme";

export function FeedEntryCard({ item, onPress }: { item: FeedItem; onPress: () => void }) {
  const { session } = useAuth();
  const { entry, vehicle, owner } = item;
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchLikeCount(entry.id).then(setLikeCount);
    if (session) hasLiked(entry.id, session.user.id).then(setLiked);
  }, [entry.id, session]);

  const onToggleLike = async () => {
    if (!session) return;
    if (liked) {
      await unlike(entry.id, session.user.id);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await like(entry.id, session.user.id);
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={vehicle.type_vehicule === "moto" ? "bicycle" : "car-sport"} size={16} color={colors.textMuted} />
        <Text style={styles.headerText}>
          @{owner.username} · {vehicle.brand} {vehicle.model}
        </Text>
      </View>

      {entry.photos.length > 0 ? (
        <Image source={{ uri: entry.photos[0] }} style={styles.photo} contentFit="cover" />
      ) : null}

      <View style={styles.body}>
        <Text style={styles.category}>{categoryLabels[entry.category] ?? entry.category}</Text>
        <Text style={styles.title}>{entry.title}</Text>
        {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}

        <Pressable onPress={onToggleLike} style={styles.likeRow} hitSlop={8}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? colors.danger : colors.textMuted} />
          <Text style={styles.likeCount}>{likeCount}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  photo: {
    width: "100%",
    height: 180,
    marginTop: spacing.sm,
  },
  body: {
    padding: spacing.md,
    gap: 4,
  },
  category: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  likeCount: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

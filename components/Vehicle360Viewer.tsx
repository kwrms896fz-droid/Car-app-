import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, spacing } from "@/lib/theme";

interface Vehicle360ViewerProps {
  photos: string[];
  height?: number;
}

const PIXELS_PER_FRAME = 18;

export function Vehicle360Viewer({ photos, height = 260 }: Vehicle360ViewerProps) {
  const [index, setIndex] = useState(0);
  const startIndex = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => photos.length > 1,
        onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dx) > 4,
        onPanResponderGrant: () => {
          startIndex.current = index;
        },
        onPanResponderMove: (_evt, gesture) => {
          const framesMoved = Math.round(gesture.dx / PIXELS_PER_FRAME);
          let next = (startIndex.current - framesMoved) % photos.length;
          if (next < 0) next += photos.length;
          setIndex(next);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [photos.length]
  );

  if (photos.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Ionicons name="sync-outline" size={36} color={colors.textMuted} />
        <Text style={styles.emptyText}>Aucune photo de rotation pour l'instant</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]} {...panResponder.panHandlers}>
      <Image source={{ uri: photos[index] }} style={styles.image} contentFit="cover" transition={0} />
      <View style={styles.hint}>
        <Ionicons name="sync" size={14} color={colors.text} />
        <Text style={styles.hintText}>Glisser pour tourner</Text>
      </View>
      {photos.length > 1 ? (
        <View style={styles.dots}>
          <Text style={styles.dotsText}>
            {index + 1}/{photos.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  empty: {
    width: "100%",
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  hint: {
    position: "absolute",
    bottom: spacing.sm,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10,10,15,0.6)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  hintText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    fontSize: 11,
  },
  dots: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(10,10,15,0.6)",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dotsText: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 11,
  },
});

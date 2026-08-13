import { Text } from "react-native";

import { fonts } from "@/lib/theme";

// Applique Inter comme police par défaut à tous les <Text> sans avoir à
// répéter fontFamily partout. Les titres surchargent explicitement avec
// fonts.display (Space Grotesk) dans leurs propres styles.
const AnyText = Text as unknown as { defaultProps?: { style?: unknown } };
AnyText.defaultProps = AnyText.defaultProps || {};
AnyText.defaultProps.style = [{ fontFamily: fonts.body }, AnyText.defaultProps.style];

const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL ?? "https://carnetgarage.app";

export function publicVehicleUrl(vehicleId: string): string {
  return `${webBaseUrl}/vehicle/${vehicleId}`;
}

export const places = [
  { id: 'port', names: ['Casa Port', 'Casa Port', 'كازا بور'], x: 70, y: 23 },
  { id: 'hassan', names: ['Hassan II Mosque', 'Mosquée Hassan-II', 'مسجد الحسن الثاني'], x: 22, y: 30 },
  { id: 'maarif', names: ['Maârif', 'Maârif', 'المعاريف'], x: 49, y: 72 },
  { id: 'habous', names: ['Habous', 'Habous', 'الأحباس'], x: 80, y: 79 },
] as const;

export type Place = typeof places[number];
export type Quote = { pickup: Place; dropoff: Place; minutes: number; baseMinor: number; distanceMinor: number; totalMinor: number };
export const steps = ['confirmed', 'approaching', 'onboard', 'completed'] as const;
export type Status = typeof steps[number];

export function quoteRide(pickupId: string, dropoffId: string): Quote | null {
  const pickup = places.find(({ id }) => id === pickupId);
  const dropoff = places.find(({ id }) => id === dropoffId);
  if (!pickup || !dropoff || pickup === dropoff) return null;

  const distance = Math.hypot(pickup.x - dropoff.x, pickup.y - dropoff.y);
  const baseMinor = 900;
  const distanceMinor = Math.round(distance / 5) * 100;
  return {
    pickup,
    dropoff,
    minutes: Math.ceil(6 + distance / 6),
    baseMinor,
    distanceMinor,
    totalMinor: baseMinor + distanceMinor,
  };
}

export function nextStatus(status: Status): Status {
  return steps[steps.indexOf(status) + 1] ?? status;
}

import { Venue, VenueType } from '@/types/venue';
import { Booking } from '@/types/booking';

export function allocateVenue(
  venues: Venue[],
  bookings: Booking[],
  venueType: VenueType,
  date: string,
  startTime: string,
  endTime: string
): Venue | null {
  const typeMatched = venues.filter(
    (v) => v.type === venueType && v.status === 'available'
  );

  if (typeMatched.length === 0) return null;

  const available = typeMatched.filter((venue) => {
    return !bookings.some(
      (b) =>
        b.assignedVenueId === venue.id &&
        b.date === date &&
        b.status !== 'rejected' &&
        b.status !== 'cancelled' &&
        !(endTime <= b.startTime || startTime >= b.endTime)
    );
  });

  if (available.length === 0) return null;

  const scored = available.map((venue) => {
    const venueBookings = bookings.filter(
      (b) =>
        b.assignedVenueId === venue.id &&
        b.date === date &&
        b.status !== 'rejected' &&
        b.status !== 'cancelled'
    );

    const loadScore = (10 - venueBookings.length) * 10;

    let contiguityScore = 50;
    if (venueBookings.length === 0) {
      contiguityScore = 100;
    } else {
      const allBookedSlots = venueBookings.flatMap((b) => {
        const start = parseInt(b.startTime.split(':')[0], 10);
        const end = parseInt(b.endTime.split(':')[0], 10);
        return Array.from({ length: end - start }, (_, i) => start + i);
      });
      const uniqueBooked = new Set(allBookedSlots);
      const requestedStart = parseInt(startTime.split(':')[0], 10);
      const requestedEnd = parseInt(endTime.split(':')[0], 10);

      let adjacent = 0;
      for (let h = requestedStart - 1; h >= 8; h--) {
        if (!uniqueBooked.has(h)) adjacent++;
        else break;
      }
      for (let h = requestedEnd; h <= 21; h++) {
        if (!uniqueBooked.has(h)) adjacent++;
        else break;
      }
      contiguityScore = Math.min(100, adjacent * 20);
    }

    return { venue, score: loadScore + contiguityScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].venue;
}

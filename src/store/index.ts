import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Venue } from '@/types/venue';
import { Booking } from '@/types/booking';
import { Approval, ApprovalRole } from '@/types/approval';
import { mockVenues } from '@/data/venues';
import { mockBookings } from '@/data/bookings';
import { mockApprovals } from '@/data/approvals';
import { allocateVenue } from '@/utils/allocation';
import { generateId } from '@/utils/format';

const STORAGE_KEY = 'fitness_center_app_state';

const loadPersistedState = (): { bookings: Booking[]; approvals: Approval[] } | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { bookings: parsed.bookings || [], approvals: parsed.approvals || [] };
    }
  } catch (e) {
    console.error('[Store] Failed to load persisted state:', e);
  }
  return null;
};

const persistState = (bookings: Booking[], approvals: Approval[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify({ bookings, approvals }));
  } catch (e) {
    console.error('[Store] Failed to persist state:', e);
  }
};

const persisted = loadPersistedState();

interface BookingPrefill {
  venueType?: Venue['type'];
  date?: string;
  startTime?: string;
  endTime?: string;
  sourceVenueId?: string;
}

interface AppState {
  venues: Venue[];
  bookings: Booking[];
  approvals: Approval[];
  bookingPrefill: BookingPrefill | null;

  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  addApproval: (approval: Approval) => void;
  approveItem: (approvalId: string, role: ApprovalRole) => void;
  rejectItem: (approvalId: string, role: ApprovalRole, comment: string) => void;
  autoAllocate: (venueType: Venue['type'], date: string, startTime: string, endTime: string) => Venue | null;
  createBookingWithApproval: (bookingData: Omit<Booking, 'id' | 'status' | 'assignedVenueId' | 'assignedVenueName' | 'createdAt'>, venueId?: string) => { booking: Booking; approval: Approval } | null;
  setBookingPrefill: (prefill: BookingPrefill) => void;
  clearBookingPrefill: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  venues: mockVenues,
  bookings: persisted?.bookings || mockBookings,
  approvals: persisted?.approvals || mockApprovals,

  addBooking: (booking) =>
    set((state) => {
      const bookings = [...state.bookings, booking];
      persistState(bookings, state.approvals);
      return { bookings };
    }),

  updateBooking: (id, updates) =>
    set((state) => {
      const bookings = state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      );
      persistState(bookings, state.approvals);
      return { bookings };
    }),

  addApproval: (approval) =>
    set((state) => {
      const approvals = [...state.approvals, approval];
      persistState(state.bookings, approvals);
      return { approvals };
    }),

  approveItem: (approvalId, role) =>
    set((state) => {
      let updatedBookings = [...state.bookings];
      const approvals = state.approvals.map((a) => {
        if (a.id !== approvalId) return a;

        const newApprovals = a.approvals.map((item) =>
          item.role === role
            ? { ...item, status: 'approved' as const, timestamp: new Date().toLocaleString(), comment: '同意' }
            : item
        );

        const allApproved = newApprovals.every((item) => item.status === 'approved');
        const anyRejected = newApprovals.some((item) => item.status === 'rejected');

        let overallStatus = a.overallStatus;
        if (allApproved) overallStatus = 'approved';
        else if (anyRejected) overallStatus = 'rejected';

        if (overallStatus === 'approved') {
          updatedBookings = updatedBookings.map((b) =>
            b.id === a.bookingId ? { ...b, status: 'approved' as const } : b
          );
        } else if (overallStatus === 'rejected') {
          updatedBookings = updatedBookings.map((b) =>
            b.id === a.bookingId ? { ...b, status: 'rejected' as const } : b
          );
        }

        return { ...a, approvals: newApprovals, overallStatus };
      });

      persistState(updatedBookings, approvals);
      return { approvals, bookings: updatedBookings };
    }),

  rejectItem: (approvalId, role, comment) =>
    set((state) => {
      let updatedBookings = [...state.bookings];
      const approvals = state.approvals.map((a) => {
        if (a.id !== approvalId) return a;

        const newApprovals = a.approvals.map((item) =>
          item.role === role
            ? { ...item, status: 'rejected' as const, timestamp: new Date().toLocaleString(), comment }
            : item
        );

        updatedBookings = updatedBookings.map((b) =>
          b.id === a.bookingId ? { ...b, status: 'rejected' as const } : b
        );

        return { ...a, approvals: newApprovals, overallStatus: 'rejected' as const };
      });

      persistState(updatedBookings, approvals);
      return { approvals, bookings: updatedBookings };
    }),

  autoAllocate: (venueType, date, startTime, endTime) => {
    return allocateVenue(get().venues, get().bookings, venueType, date, startTime, endTime);
  },

  createBookingWithApproval: (bookingData, venueId?) => {
    let venue: Venue | null | undefined = undefined;

    if (venueId) {
      venue = get().venues.find((v) => v.id === venueId) || null;
      if (venue) {
        const hasConflict = get().bookings.some((b) =>
          b.assignedVenueId === venueId &&
          b.date === bookingData.date &&
          b.status !== 'rejected' &&
          !(bookingData.endTime <= b.startTime || bookingData.startTime >= b.endTime)
        );
        if (hasConflict) {
          console.warn('[Booking] Pre-allocated venue has time conflict, re-allocating...');
          venue = null;
        }
      }
    }

    if (!venue) {
      venue = get().autoAllocate(
        bookingData.venueType,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime
      );
    }

    if (!venue) {
      console.error('[Booking] No available venue found for allocation');
      return null;
    }

    const bookingId = generateId();
    const booking: Booking = {
      ...bookingData,
      id: bookingId,
      status: 'pending_approval',
      assignedVenueId: venue.id,
      assignedVenueName: venue.name,
      createdAt: new Date().toLocaleString(),
    };

    const approvalId = generateId();
    const approval: Approval = {
      id: approvalId,
      bookingId,
      bookingTitle: bookingData.title,
      organizer: bookingData.organizer,
      venueTypeName: venue.name,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      expectedAttendees: bookingData.expectedAttendees,
      securityRequired: bookingData.securityRequired,
      approvals: [
        { role: 'venue_manager', approverName: '王建国', status: 'pending', comment: '', timestamp: '' },
        { role: 'security', approverName: '李安全', status: 'pending', comment: '', timestamp: '' },
        { role: 'finance', approverName: '赵财务', status: 'pending', comment: '', timestamp: '' },
      ],
      overallStatus: 'pending',
      createdAt: new Date().toLocaleString(),
    };

    set((state) => {
      const bookings = [...state.bookings, booking];
      const approvals = [...state.approvals, approval];
      persistState(bookings, approvals);
      return { bookings, approvals };
    });

    console.info('[Booking] Created booking and approval:', { bookingId, approvalId, venue: venue.name });
    return { booking, approval };
  },

  setBookingPrefill: (prefill) =>
    set(() => ({
      bookingPrefill: prefill,
    })),

  clearBookingPrefill: () =>
    set(() => ({
      bookingPrefill: null,
    })),
}));

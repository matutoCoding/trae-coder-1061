import { create } from 'zustand';
import { Venue } from '@/types/venue';
import { Booking } from '@/types/booking';
import { Approval, ApprovalRole } from '@/types/approval';
import { mockVenues } from '@/data/venues';
import { mockBookings } from '@/data/bookings';
import { mockApprovals } from '@/data/approvals';
import { allocateVenue } from '@/utils/allocation';
import { generateId } from '@/utils/format';

interface AppState {
  venues: Venue[];
  bookings: Booking[];
  approvals: Approval[];

  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  addApproval: (approval: Approval) => void;
  approveItem: (approvalId: string, role: ApprovalRole) => void;
  rejectItem: (approvalId: string, role: ApprovalRole, comment: string) => void;
  autoAllocate: (venueType: Venue['type'], date: string, startTime: string, endTime: string) => Venue | null;
  createBookingWithApproval: (bookingData: Omit<Booking, 'id' | 'status' | 'assignedVenueId' | 'assignedVenueName' | 'createdAt'>) => { booking: Booking; approval: Approval } | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  venues: mockVenues,
  bookings: mockBookings,
  approvals: mockApprovals,

  addBooking: (booking) =>
    set((state) => ({ bookings: [...state.bookings, booking] })),

  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),

  addApproval: (approval) =>
    set((state) => ({ approvals: [...state.approvals, approval] })),

  approveItem: (approvalId, role) =>
    set((state) => {
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

        const updatedApproval = { ...a, approvals: newApprovals, overallStatus };

        if (overallStatus === 'approved') {
          const bookingId = a.bookingId;
          state.bookings = state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'approved' as const } : b
          );
        } else if (overallStatus === 'rejected') {
          const bookingId = a.bookingId;
          state.bookings = state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'rejected' as const } : b
          );
        }

        return updatedApproval;
      });

      return { approvals, bookings: state.bookings };
    }),

  rejectItem: (approvalId, role, comment) =>
    set((state) => {
      const approvals = state.approvals.map((a) => {
        if (a.id !== approvalId) return a;

        const newApprovals = a.approvals.map((item) =>
          item.role === role
            ? { ...item, status: 'rejected' as const, timestamp: new Date().toLocaleString(), comment }
            : item
        );

        const bookingId = a.bookingId;
        state.bookings = state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'rejected' as const } : b
        );

        return { ...a, approvals: newApprovals, overallStatus: 'rejected' as const };
      });

      return { approvals, bookings: state.bookings };
    }),

  autoAllocate: (venueType, date, startTime, endTime) => {
    return allocateVenue(get().venues, get().bookings, venueType, date, startTime, endTime);
  },

  createBookingWithApproval: (bookingData) => {
    const venue = get().autoAllocate(
      bookingData.venueType,
      bookingData.date,
      bookingData.startTime,
      bookingData.endTime
    );

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

    set((state) => ({
      bookings: [...state.bookings, booking],
      approvals: [...state.approvals, approval],
    }));

    console.info('[Booking] Created booking and approval:', { bookingId, approvalId, venue: venue.name });
    return { booking, approval };
  },
}));

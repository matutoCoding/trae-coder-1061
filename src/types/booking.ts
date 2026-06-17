import { VenueType } from './venue';

export type BookingStatus = 'pending_approval' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  title: string;
  organizer: string;
  contactPhone: string;
  expectedAttendees: number;
  venueType: VenueType;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  assignedVenueId: string;
  assignedVenueName: string;
  securityRequired: number;
  purpose: string;
  createdAt: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_approval: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  cancelled: '已取消',
  completed: '已完成',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending_approval: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  cancelled: '#9CA3AF',
  completed: '#0D9488',
};

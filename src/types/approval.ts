export type ApprovalRole = 'venue_manager' | 'security' | 'finance';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalItemStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  role: ApprovalRole;
  approverName: string;
  status: ApprovalItemStatus;
  comment: string;
  timestamp: string;
}

export interface Approval {
  id: string;
  bookingId: string;
  bookingTitle: string;
  organizer: string;
  venueTypeName: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedAttendees: number;
  securityRequired: number;
  approvals: ApprovalItem[];
  overallStatus: ApprovalStatus;
  createdAt: string;
}

export const APPROVAL_ROLE_LABELS: Record<ApprovalRole, string> = {
  venue_manager: '场馆管理',
  security: '安保',
  finance: '财务',
};

export const APPROVAL_ROLE_ICONS: Record<ApprovalRole, string> = {
  venue_manager: '🏢',
  security: '🛡️',
  finance: '💰',
};

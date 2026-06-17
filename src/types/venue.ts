export type VenueType = 'basketball' | 'badminton' | 'swimming' | 'table_tennis' | 'fitness' | 'multipurpose';

export type VenueStatus = 'available' | 'occupied' | 'maintenance';

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  capacity: number;
  location: string;
  facilities: string[];
  status: VenueStatus;
  hourlyRate: number;
  description: string;
  image: string;
}

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  basketball: '篮球馆',
  badminton: '羽毛球馆',
  swimming: '游泳馆',
  table_tennis: '乒乓球馆',
  fitness: '健身房',
  multipurpose: '综合馆',
};

export const VENUE_TYPE_LIST: { value: VenueType; label: string }[] = [
  { value: 'basketball', label: '篮球馆' },
  { value: 'badminton', label: '羽毛球馆' },
  { value: 'swimming', label: '游泳馆' },
  { value: 'table_tennis', label: '乒乓球馆' },
  { value: 'fitness', label: '健身房' },
  { value: 'multipurpose', label: '综合馆' },
];

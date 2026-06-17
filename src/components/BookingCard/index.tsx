import React from 'react';
import { View, Text } from '@tarojs/components';
import { Booking, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types/booking';
import { VENUE_TYPE_LABELS } from '@/types/venue';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface BookingCardProps {
  booking: Booking;
  onClick?: (id: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick }) => {
  return (
    <View className={styles.card} onClick={() => onClick?.(booking.id)}>
      <View className={styles.header}>
        <Text className={styles.title}>{booking.title}</Text>
        <StatusTag
          status={booking.status}
          label={BOOKING_STATUS_LABELS[booking.status]}
          color={BOOKING_STATUS_COLORS[booking.status]}
          size="small"
        />
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>📅</Text>
          <Text className={styles.value}>{booking.date} {booking.startTime}-{booking.endTime}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>🏟️</Text>
          <Text className={styles.value}>{VENUE_TYPE_LABELS[booking.venueType]} · {booking.assignedVenueName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>👤</Text>
          <Text className={styles.value}>{booking.organizer}</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingCard;

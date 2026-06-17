import React from 'react';
import { View, Text } from '@tarojs/components';
import { Venue, VENUE_TYPE_LABELS } from '@/types/venue';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface VenueCardProps {
  venue: Venue;
  onClick?: (id: string) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick }) => {
  const statusConfig = {
    available: { label: '空闲', color: '#10B981' },
    occupied: { label: '占用', color: '#F59E0B' },
    maintenance: { label: '维修', color: '#9CA3AF' },
  };

  const config = statusConfig[venue.status];

  return (
    <View className={styles.card} onClick={() => onClick?.(venue.id)}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.name}>{venue.name}</Text>
          <StatusTag status={venue.status} label={config.label} color={config.color} size="small" />
        </View>
        <Text className={styles.type}>{VENUE_TYPE_LABELS[venue.type]}</Text>
      </View>
      <View className={styles.info}>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>📍</Text>
          <Text className={styles.infoText}>{venue.location}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>👥</Text>
          <Text className={styles.infoText}>容纳 {venue.capacity} 人</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>💰</Text>
          <Text className={styles.infoText}>¥{venue.hourlyRate}/时</Text>
        </View>
      </View>
      <View className={styles.facilities}>
        {venue.facilities.slice(0, 3).map((f) => (
          <View key={f} className={styles.facility}>
            <Text className={styles.facilityText}>{f}</Text>
          </View>
        ))}
        {venue.facilities.length > 3 && (
          <View className={styles.facility}>
            <Text className={styles.facilityText}>+{venue.facilities.length - 3}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default VenueCard;

import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { VENUE_TYPE_LABELS, VenueStatus } from '@/types/venue';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types/booking';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

const VenueDetailPage: React.FC = () => {
  const router = useRouter();
  const { venues, bookings } = useAppStore();

  const venue = useMemo(
    () => venues.find((v) => v.id === router.params.id),
    [venues, router.params.id]
  );

  const venueBookings = useMemo(
    () =>
      venue
        ? bookings
            .filter((b) => b.assignedVenueId === venue.id && b.status !== 'rejected' && b.status !== 'cancelled')
            .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        : [],
    [venue, bookings]
  );

  if (!venue) {
    return (
      <View className={styles.container}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>🏟️</Text>
          <Text className={styles.emptyText}>未找到场馆信息</Text>
        </View>
      </View>
    );
  }

  const statusConfig: Record<VenueStatus, { label: string; color: string }> = {
    available: { label: '空闲', color: '#10B981' },
    occupied: { label: '占用', color: '#F59E0B' },
    maintenance: { label: '维修中', color: '#9CA3AF' },
  };

  const config = statusConfig[venue.status];

  return (
    <View className={styles.container}>
      <Image className={styles.coverImage} src={venue.image} mode="aspectFill" />

      <View className={styles.infoCard}>
        <View className={styles.nameRow}>
          <Text className={styles.venueName}>{venue.name}</Text>
          <StatusTag status={venue.status} label={config.label} color={config.color} />
        </View>
        <Text className={styles.venueType}>{VENUE_TYPE_LABELS[venue.type]}</Text>

        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>📍</Text>
            <Text className={styles.infoLabel}>位置</Text>
            <Text className={styles.infoValue}>{venue.location}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>👥</Text>
            <Text className={styles.infoLabel}>容量</Text>
            <Text className={styles.infoValue}>{venue.capacity} 人</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>💰</Text>
            <Text className={styles.infoLabel}>费率</Text>
            <Text className={styles.infoValue}>¥{venue.hourlyRate}/时</Text>
          </View>
        </View>
      </View>

      <View className={styles.descCard}>
        <Text className={styles.cardTitle}>场馆介绍</Text>
        <Text className={styles.descText}>{venue.description}</Text>
      </View>

      <View className={styles.facilitiesCard}>
        <Text className={styles.cardTitle}>设施配置</Text>
        <View className={styles.facilitiesList}>
          {venue.facilities.map((f) => (
            <View key={f} className={styles.facility}>
              <Text className={styles.facilityText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.scheduleCard}>
        <Text className={styles.cardTitle}>近期排期</Text>
        {venueBookings.length > 0 ? (
          <View className={styles.scheduleList}>
            {venueBookings.map((b) => (
              <View key={b.id} className={styles.scheduleItem}>
                <View className={styles.scheduleTime}>
                  <Text className={styles.scheduleDate}>{b.date}</Text>
                  <Text className={styles.scheduleSlot}>{b.startTime}-{b.endTime}</Text>
                </View>
                <View className={styles.scheduleInfo}>
                  <Text className={styles.scheduleTitle}>{b.title}</Text>
                  <Text className={styles.scheduleOrganizer}>{b.organizer}</Text>
                </View>
                <StatusTag
                  status={b.status}
                  label={BOOKING_STATUS_LABELS[b.status]}
                  color={BOOKING_STATUS_COLORS[b.status]}
                  size="small"
                />
              </View>
            ))}
          </View>
        ) : (
          <Text className={styles.emptySchedule}>暂无排期记录</Text>
        )}
      </View>
    </View>
  );
};

export default VenueDetailPage;

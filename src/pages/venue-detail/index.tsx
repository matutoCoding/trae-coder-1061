import React, { useMemo, useState } from 'react';
import { View, Text, Image, Picker, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { VENUE_TYPE_LABELS, VenueStatus, VenueType } from '@/types/venue';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS, Booking } from '@/types/booking';
import StatusTag from '@/components/StatusTag';
import { formatDate, getWeekday } from '@/utils/format';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';

const VenueDetailPage: React.FC = () => {
  const router = useRouter();
  const { venues, bookings } = useAppStore();
  const today = dayjs().format('YYYY-MM-DD');
  const initialDate = router.params.date || today;
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const venue = useMemo(
    () => venues.find((v) => v.id === router.params.id),
    [venues, router.params.id]
  );

  const dateBookings = useMemo(
    () =>
      venue
        ? bookings.filter(
            (b) =>
              b.assignedVenueId === venue.id &&
              b.date === selectedDate &&
              b.status !== 'rejected' &&
              b.status !== 'cancelled'
          )
        : [],
    [venue, bookings, selectedDate]
  );

  const upcomingBookings = useMemo(
    () =>
      venue
        ? bookings
            .filter(
              (b) =>
                b.assignedVenueId === venue.id &&
                b.date >= today &&
                b.status !== 'rejected' &&
                b.status !== 'cancelled'
            )
            .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
            .slice(0, 5)
        : [],
    [venue, bookings, today]
  );

  const timeSlots = useMemo(() => {
    const slots: { start: string; end: string; booking: Booking | null }[] = [];
    const startHour = 8;
    const endHour = 22;

    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;

      const overlappingBooking = dateBookings.find(
        (b) => !(end <= b.startTime || start >= b.endTime)
      );

      slots.push({ start, end, booking: overlappingBooking || null });
    }

    return slots;
  }, [dateBookings]);

  const handleSlotClick = (slot: { start: string; end: string; booking: Booking | null }) => {
    if (slot.booking) {
      Taro.navigateTo({ url: `/pages/booking-detail/index?id=${slot.booking.id}` });
      return;
    }
    const venueTypeValue = venue?.type || 'basketball';
    useAppStore.getState().setBookingPrefill({
      venueType: venueTypeValue,
      date: selectedDate,
      startTime: slot.start,
      endTime: slot.end,
      sourceVenueId: venue?.id,
    });
    Taro.switchTab({
      url: '/pages/booking/index',
      success: () => {
        console.info('[VenueDetail] Navigate to booking with', { date: selectedDate, startTime: slot.start, endTime: slot.end, venueType: venueTypeValue });
      },
    });
  };

  const handlePrevDay = () => {
    const prev = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(next);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.detail.value);
  };

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

      <View className={styles.timelineCard}>
        <View className={styles.timelineHeader}>
          <Text className={styles.cardTitle}>当日排期时间轴</Text>
          <View className={styles.dateNav}>
            <View className={styles.dateNavBtn} onClick={handlePrevDay}>
              <Text className={styles.dateNavBtnText}>◀</Text>
            </View>
            <Picker mode="date" value={selectedDate} onChange={handleDateChange}>
              <View className={styles.datePicker}>
                <Text className={styles.datePickerText}>
                  {formatDate(selectedDate)} {getWeekday(selectedDate)}
                </Text>
              </View>
            </Picker>
            <View className={styles.dateNavBtn} onClick={handleNextDay}>
              <Text className={styles.dateNavBtnText}>▶</Text>
            </View>
          </View>
        </View>

        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotOccupied}`} />
            <Text className={styles.legendText}>已占用</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={`${styles.legendDot} ${styles.legendDotFree}`} />
            <Text className={styles.legendText}>可预订</Text>
          </View>
        </View>

        <ScrollView scrollX className={styles.timelineScroll}>
          <View className={styles.timeline}>
            {timeSlots.map((slot, index) => (
              <View
                key={index}
                className={classnames(
                  styles.timelineSlot,
                  slot.booking ? styles.timelineSlotOccupied : styles.timelineSlotFree,
                  !slot.booking && styles.timelineSlotClickable
                )}
                onClick={() => handleSlotClick(slot)}
              >
                <Text className={styles.timelineSlotTime}>{slot.start}</Text>
                {slot.booking ? (
                  <View className={styles.timelineSlotBooking}>
                    <Text className={styles.timelineSlotTitle} numberOfLines={1}>{slot.booking.title}</Text>
                    <Text className={styles.timelineSlotOrganizer} numberOfLines={1}>{slot.booking.organizer}</Text>
                  </View>
                ) : (
                  <View className={styles.timelineSlotFreeInner}>
                    <Text className={styles.timelineSlotFreeText}>可约</Text>
                  </View>
                )}
                <Text className={styles.timelineSlotTime}>{slot.end}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.scheduleCard}>
        <Text className={styles.cardTitle}>近期排期</Text>
        {upcomingBookings.length > 0 ? (
          <View className={styles.scheduleList}>
            {upcomingBookings.map((b) => (
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

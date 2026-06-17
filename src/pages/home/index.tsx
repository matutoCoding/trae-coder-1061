import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatDate, getWeekday } from '@/utils/format';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types/booking';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { venues, bookings, approvals } = useAppStore();
  const today = dayjs().format('YYYY-MM-DD');

  const todayBookings = useMemo(
    () => bookings.filter((b) => b.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, today]
  );

  const pendingApprovals = useMemo(
    () => approvals.filter((a) => a.overallStatus === 'pending'),
    [approvals]
  );

  const availableVenues = useMemo(
    () => venues.filter((v) => v.status === 'available'),
    [venues]
  );

  const handleGoBooking = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  const handleGoApproval = () => {
    Taro.switchTab({ url: '/pages/approval/index' });
  };

  const handleGoBookingDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/booking-detail/index?id=${id}` });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.headerTitle}>全民健身中心</Text>
            <View>
              <Text className={styles.headerDate}>
                {formatDate(today)} {getWeekday(today)}
              </Text>
            </View>
          </View>
          {pendingApprovals.length > 0 && (
            <View className={styles.headerBadge}>
              <Text className={styles.headerBadgeText}>
                {pendingApprovals.length}项待审批
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{availableVenues.length}</Text>
          <Text className={styles.statLabel}>空闲场馆</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{todayBookings.length}</Text>
          <Text className={styles.statLabel}>今日预订</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{pendingApprovals.length}</Text>
          <Text className={styles.statLabel}>待审批</Text>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.quickAction} onClick={handleGoBooking}>
          <View className={`${styles.quickActionIcon} ${styles.quickActionIconBooking}`}>
            📋
          </View>
          <View>
            <Text className={styles.quickActionText}>新建预订</Text>
            <Text className={styles.quickActionDesc}>智能分配场馆</Text>
          </View>
        </View>
        <View className={styles.quickAction} onClick={handleGoApproval}>
          <View className={`${styles.quickActionIcon} ${styles.quickActionIconApproval}`}>
            ✅
          </View>
          <View>
            <Text className={styles.quickActionText}>审批中心</Text>
            <Text className={styles.quickActionDesc}>会签审批管理</Text>
          </View>
        </View>
        <View className={styles.quickAction} onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
          <View className={`${styles.quickActionIcon} ${styles.quickActionIconSchedule}`}>
            📅
          </View>
          <View>
            <Text className={styles.quickActionText}>场馆排期</Text>
            <Text className={styles.quickActionDesc}>今日排期总览</Text>
          </View>
        </View>
        <View className={styles.quickAction} onClick={() => Taro.navigateTo({ url: '/pages/venue-detail/index?id=v001' })}>
          <View className={`${styles.quickActionIcon} ${styles.quickActionIconQuery}`}>
            🔍
          </View>
          <View>
            <Text className={styles.quickActionText}>场馆查询</Text>
            <Text className={styles.quickActionDesc}>查看场馆详情</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日排期</Text>
          <Text className={styles.sectionMore}>共{todayBookings.length}项</Text>
        </View>
        {todayBookings.length > 0 ? (
          <View className={styles.scheduleList}>
            {todayBookings.map((booking) => (
              <View
                key={booking.id}
                className={styles.scheduleCard}
                onClick={() => handleGoBookingDetail(booking.id)}
              >
                <View className={styles.scheduleTime}>
                  <Text className={styles.scheduleTimeStart}>{booking.startTime}</Text>
                  <Text className={styles.scheduleTimeEnd}>{booking.endTime}</Text>
                </View>
                <View className={styles.scheduleDivider} />
                <View className={styles.scheduleInfo}>
                  <Text className={styles.scheduleTitle}>{booking.title}</Text>
                  <Text className={styles.scheduleVenue}>{booking.assignedVenueName}</Text>
                </View>
                <View
                  className={`${styles.scheduleStatus} ${
                    booking.status === 'pending_approval'
                      ? styles.scheduleStatusPending
                      : booking.status === 'approved'
                      ? styles.scheduleStatusApproved
                      : styles.scheduleStatusRejected
                  }`}
                >
                  <Text
                    className={styles.scheduleStatusText}
                    style={{ color: BOOKING_STATUS_COLORS[booking.status] }}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyText}>今日暂无排期</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>近期活动</Text>
        </View>
        <View className={styles.recentList}>
          {bookings
            .filter((b) => b.date >= today)
            .slice(0, 5)
            .map((booking) => (
              <View
                key={booking.id}
                className={styles.scheduleCard}
                onClick={() => handleGoBookingDetail(booking.id)}
              >
                <View className={styles.scheduleTime}>
                  <Text className={styles.scheduleTimeStart}>{booking.startTime}</Text>
                  <Text className={styles.scheduleTimeEnd}>{booking.endTime}</Text>
                </View>
                <View className={styles.scheduleDivider} />
                <View className={styles.scheduleInfo}>
                  <Text className={styles.scheduleTitle}>{booking.title}</Text>
                  <Text className={styles.scheduleVenue}>
                    {booking.date} · {booking.assignedVenueName}
                  </Text>
                </View>
                <View
                  className={`${styles.scheduleStatus} ${
                    booking.status === 'pending_approval'
                      ? styles.scheduleStatusPending
                      : booking.status === 'approved'
                      ? styles.scheduleStatusApproved
                      : styles.scheduleStatusRejected
                  }`}
                >
                  <Text
                    className={styles.scheduleStatusText}
                    style={{ color: BOOKING_STATUS_COLORS[booking.status] }}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
};

export default HomePage;

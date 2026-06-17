import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types/booking';
import { VENUE_TYPE_LABELS } from '@/types/venue';
import StatusTag from '@/components/StatusTag';
import CountersignProgress from '@/components/CountersignProgress';
import styles from './index.module.scss';

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const { bookings, approvals, venues } = useAppStore();

  const booking = useMemo(
    () => bookings.find((b) => b.id === router.params.id),
    [bookings, router.params.id]
  );

  const approval = useMemo(
    () => (booking ? approvals.find((a) => a.bookingId === booking.id) : null),
    [booking, approvals]
  );

  const venue = useMemo(
    () => (booking ? venues.find((v) => v.id === booking.assignedVenueId) : null),
    [booking, venues]
  );

  if (!booking) {
    return (
      <View className={styles.container}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>未找到预订信息</Text>
        </View>
      </View>
    );
  }

  const calcMinSecurity = (n: number): number => {
    if (n <= 50) return 1;
    if (n <= 100) return 2;
    if (n <= 300) return 5;
    return 10;
  };
  const minSecurity = calcMinSecurity(booking.expectedAttendees);

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <Text className={styles.bookingTitle}>{booking.title}</Text>
          <StatusTag
            status={booking.status}
            label={BOOKING_STATUS_LABELS[booking.status]}
            color={BOOKING_STATUS_COLORS[booking.status]}
          />
        </View>
        <Text className={styles.bookingId}>编号：{booking.id}</Text>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>活动信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🏢</Text>
          <Text className={styles.infoLabel}>承办方</Text>
          <Text className={styles.infoValue}>{booking.organizer}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>�</Text>
          <Text className={styles.infoLabel}>联系电话</Text>
          <Text className={styles.infoValue}>{booking.contactPhone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>👥</Text>
          <Text className={styles.infoLabel}>预计人数</Text>
          <Text className={styles.infoValue}>{booking.expectedAttendees} 人</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📝</Text>
          <Text className={styles.infoLabel}>活动说明</Text>
          <Text className={styles.infoValue}>{booking.purpose}</Text>
        </View>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>场馆与时间</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🏟️</Text>
          <Text className={styles.infoLabel}>场馆类型</Text>
          <Text className={styles.infoValue}>{VENUE_TYPE_LABELS[booking.venueType]}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📍</Text>
          <Text className={styles.infoLabel}>分配场馆</Text>
          <Text className={styles.infoValue}>{booking.assignedVenueName}</Text>
        </View>
        {venue && (
          <View className={styles.infoRow}>
            <Text className={styles.infoIcon}>🏠</Text>
            <Text className={styles.infoLabel}>场馆位置</Text>
            <Text className={styles.infoValue}>{venue.location}</Text>
          </View>
        )}
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📅</Text>
          <Text className={styles.infoLabel}>使用日期</Text>
          <Text className={styles.infoValue}>{booking.date}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🕐</Text>
          <Text className={styles.infoLabel}>使用时段</Text>
          <Text className={styles.infoValue}>{booking.startTime} - {booking.endTime}</Text>
        </View>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>安保核定</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🛡️</Text>
          <Text className={styles.infoLabel}>安保人数</Text>
          <Text className={styles.infoValue}>{booking.securityRequired} 名</Text>
        </View>
        <View className={styles.securityBar}>
          <Text className={styles.securityBarText}>
            {booking.securityRequired >= minSecurity
              ? `✅ 满足${booking.expectedAttendees}人活动最低${minSecurity}名安保要求`
              : `⚠️ ${booking.expectedAttendees}人活动需至少${minSecurity}名安保，当前${booking.securityRequired}名不足`
            }
          </Text>
        </View>
      </View>

      {approval && (
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>会签审批进度</Text>
          <CountersignProgress approvals={approval.approvals} />
          <View className={styles.approvalDetail}>
            {approval.approvals.map((item) => (
              <View key={item.role} className={styles.approvalItem}>
                <View className={styles.approvalItemHeader}>
                  <View
                    className={styles.approvalDot}
                    style={{
                      backgroundColor:
                        item.status === 'approved' ? '#10B981' : item.status === 'rejected' ? '#EF4444' : '#F59E0B',
                    }}
                  />
                  <Text className={styles.approvalRole}>
                    {item.role === 'venue_manager' ? '场馆管理' : item.role === 'security' ? '安保' : '财务'}
                  </Text>
                  <Text className={styles.approvalName}>{item.approverName}</Text>
                  <Text
                    className={classnames(styles.approvalStatus, item.status === 'approved' && styles.statusApproved, item.status === 'rejected' && styles.statusRejected, item.status === 'pending' && styles.statusPending)}
                  >
                    {item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已否决' : '待审批'}
                  </Text>
                </View>
                {item.comment && (
                  <Text className={styles.approvalComment}>意见：{item.comment}</Text>
                )}
                {item.timestamp && (
                  <Text className={styles.approvalTime}>{item.timestamp}</Text>
                )}
              </View>
            ))}
          </View>
          {approval.overallStatus === 'rejected' && (
            <View className={styles.rejectNotice}>
              <Text className={styles.rejectNoticeText}>
                ❌ 该预订已被否决，审批流程终止。原因：{approval.approvals.find((a) => a.status === 'rejected')?.comment || '无'}
              </Text>
            </View>
          )}
          {approval.overallStatus === 'approved' && (
            <View className={styles.approveNotice}>
              <Text className={styles.approveNoticeText}>
                ✅ 全票通过！预订已生效，场馆已确认预留。
              </Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.footerCard}>
        <Text className={styles.footerText}>提交时间：{booking.createdAt}</Text>
      </View>
    </View>
  );
};

export default BookingDetailPage;

import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { ApprovalRole, APPROVAL_ROLE_LABELS, APPROVAL_ROLE_ICONS } from '@/types/approval';
import CountersignProgress from '@/components/CountersignProgress';
import styles from './index.module.scss';

const calcMinSecurity = (attendees: number): number => {
  if (attendees <= 0) return 1;
  if (attendees <= 50) return 1;
  if (attendees <= 100) return 2;
  if (attendees <= 300) return 5;
  return 10;
};

const calcDurationHours = (startTime: string, endTime: string): number => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM - startH * 60 - startM) / 60;
};

const ApprovalDetailPage: React.FC = () => {
  const router = useRouter();
  const { approvals, venues, bookings, approveItem, rejectItem } = useAppStore();

  const approval = useMemo(
    () => approvals.find((a) => a.id === router.params.id),
    [approvals, router.params.id]
  );

  const booking = useMemo(
    () => bookings.find((b) => b.id === approval?.bookingId),
    [bookings, approval]
  );

  const venue = useMemo(() => {
    if (!approval) return null;
    const matched = venues.find((v) => v.name === approval.venueTypeName);
    if (matched) return matched;
    if (booking) return venues.find((v) => v.id === booking.assignedVenueId) || null;
    return null;
  }, [approval, booking, venues]);

  const capacityCheck = useMemo(() => {
    if (!approval) return null;
    const attendees = approval.expectedAttendees;
    if (venue) {
      return {
        pass: attendees <= venue.capacity,
        attendees,
        capacity: venue.capacity,
        remaining: venue.capacity - attendees,
      };
    }
    return {
      pass: true,
      attendees,
      capacity: null,
      remaining: null,
    };
  }, [approval, venue]);

  const securityCheck = useMemo(() => {
    if (!approval) return null;
    const minRequired = calcMinSecurity(approval.expectedAttendees);
    return {
      pass: approval.securityRequired >= minRequired,
      provided: approval.securityRequired,
      minRequired,
    };
  }, [approval]);

  const costEstimate = useMemo(() => {
    if (!approval) return null;
    const duration = calcDurationHours(approval.startTime, approval.endTime);
    if (venue) {
      return {
        duration,
        hourlyRate: venue.hourlyRate,
        total: Math.round(duration * venue.hourlyRate * 100) / 100,
      };
    }
    return {
      duration,
      hourlyRate: null,
      total: null,
    };
  }, [approval, venue]);

  if (!approval) {
    return (
      <View className={styles.container}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>✅</Text>
          <Text className={styles.emptyText}>未找到审批信息</Text>
        </View>
      </View>
    );
  }

  const getNextPendingRole = (): ApprovalRole | null => {
    const nextItem = approval.approvals.find((a) => a.status === 'pending');
    return nextItem ? nextItem.role : null;
  };

  const nextRole = getNextPendingRole();

  const handleApprove = () => {
    if (!nextRole) return;
    approveItem(approval.id, nextRole);
    Taro.showToast({ title: '审批通过', icon: 'success' });
  };

  const handleReject = () => {
    if (!nextRole) return;
    Taro.showModal({
      title: '否决确认',
      content: `确定要否决「${approval.bookingTitle}」的申请吗？一票否决将终止整个审批流程。`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          rejectItem(approval.id, nextRole, '不同意');
          Taro.showToast({ title: '已否决', icon: 'none' });
        }
      },
    });
  };

  const statusConfig = {
    pending: { label: '审批中', color: '#F59E0B' },
    approved: { label: '已通过', color: '#10B981' },
    rejected: { label: '已否决', color: '#EF4444' },
  };

  const config = statusConfig[approval.overallStatus];

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <Text className={styles.approvalTitle}>{approval.bookingTitle}</Text>
          <View
            className={classnames(styles.statusBadge, approval.overallStatus === 'approved' && styles.statusApproved, approval.overallStatus === 'rejected' && styles.statusRejected, approval.overallStatus === 'pending' && styles.statusPending)}
          >
            <Text className={styles.statusBadgeText} style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>
        </View>
        <Text className={styles.approvalId}>编号：{approval.id}</Text>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>申请信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>👤</Text>
          <Text className={styles.infoLabel}>承办方</Text>
          <Text className={styles.infoValue}>{approval.organizer}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🏟️</Text>
          <Text className={styles.infoLabel}>分配场馆</Text>
          <Text className={styles.infoValue}>{approval.venueTypeName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>📅</Text>
          <Text className={styles.infoLabel}>使用日期</Text>
          <Text className={styles.infoValue}>{approval.date}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🕐</Text>
          <Text className={styles.infoLabel}>使用时段</Text>
          <Text className={styles.infoValue}>{approval.startTime} - {approval.endTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>👥</Text>
          <Text className={styles.infoLabel}>预计人数</Text>
          <Text className={styles.infoValue}>{approval.expectedAttendees} 人</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoIcon}>🛡️</Text>
          <Text className={styles.infoLabel}>安保人数</Text>
          <Text className={styles.infoValue}>{approval.securityRequired} 名</Text>
        </View>
      </View>

      <View className={styles.checkCard}>
        <Text className={styles.cardTitle}>业务审核校验</Text>

        <View className={styles.checkItem}>
          <View className={styles.checkHeader}>
            <Text className={styles.checkIcon}>👥</Text>
            <Text className={styles.checkLabel}>场馆容量校验</Text>
            {capacityCheck?.pass ? (
              <Text className={styles.checkPass}>✓ 达标</Text>
            ) : (
              <Text className={styles.checkFail}>✗ 不达标</Text>
            )}
          </View>
          <View className={styles.checkBody}>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>活动人数</Text>
              <Text className={styles.checkVal}>{approval.expectedAttendees} 人</Text>
            </View>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>场馆容量</Text>
              <Text className={styles.checkVal}>{capacityCheck?.capacity ?? '未知'} 人</Text>
            </View>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>空余容量</Text>
              <Text
                className={classnames(
                  styles.checkVal,
                  capacityCheck?.pass ? styles.checkValOk : styles.checkValWarn
                )}
              >
                {capacityCheck?.remaining !== null && capacityCheck?.remaining !== undefined
                  ? `${capacityCheck.remaining} 人`
                  : '未知'}
              </Text>
            </View>
            {!capacityCheck?.pass && (
              <View className={styles.checkWarn}>
                <Text className={styles.checkWarnText}>
                  ⚠️ 活动人数超出场馆容量，建议更换更大场馆或减少人数
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.checkItem}>
          <View className={styles.checkHeader}>
            <Text className={styles.checkIcon}>🛡️</Text>
            <Text className={styles.checkLabel}>安保核定校验</Text>
            {securityCheck?.pass ? (
              <Text className={styles.checkPass}>✓ 达标</Text>
            ) : (
              <Text className={styles.checkFail}>✗ 不达标</Text>
            )}
          </View>
          <View className={styles.checkBody}>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>申请安保</Text>
              <Text className={styles.checkVal}>{securityCheck?.provided ?? 0} 名</Text>
            </View>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>最低要求</Text>
              <Text className={styles.checkVal}>{securityCheck?.minRequired ?? 0} 名</Text>
            </View>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>缺口</Text>
              <Text
                className={classnames(
                  styles.checkVal,
                  securityCheck?.pass ? styles.checkValOk : styles.checkValWarn
                )}
              >
                {securityCheck?.pass
                  ? '无缺口'
                  : `缺 ${(securityCheck?.minRequired ?? 0) - (securityCheck?.provided ?? 0)} 名`}
              </Text>
            </View>
            {!securityCheck?.pass && (
              <View className={styles.checkWarn}>
                <Text className={styles.checkWarnText}>
                  ⚠️ 安保人数不足，按标准需至少 {securityCheck?.minRequired} 名安保人员
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.checkItem}>
          <View className={styles.checkHeader}>
            <Text className={styles.checkIcon}>💰</Text>
            <Text className={styles.checkLabel}>费用估算</Text>
            <Text className={styles.checkInfo}>参考</Text>
          </View>
          <View className={styles.checkBody}>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>使用时长</Text>
              <Text className={styles.checkVal}>{costEstimate?.duration ?? 0} 小时</Text>
            </View>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>小时费率</Text>
              <Text className={styles.checkVal}>
                {costEstimate?.hourlyRate !== null ? `¥${costEstimate?.hourlyRate}/时` : '未知'}
              </Text>
            </View>
            <View className={styles.checkRow}>
              <Text className={styles.checkKey}>预估费用</Text>
              <Text className={classnames(styles.checkVal, styles.checkValHighlight)}>
                {costEstimate?.total !== null ? `¥${costEstimate?.total}` : '待核算'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>会签审批进度</Text>
        <CountersignProgress approvals={approval.approvals} />

        <View className={styles.approvalSteps}>
          {approval.approvals.map((item, index) => (
            <View key={item.role} className={styles.stepItem}>
              <View className={styles.stepLeft}>
                <View
                  className={classnames(
                    styles.stepIcon,
                    item.status === 'approved' && styles.stepIconApproved,
                    item.status === 'rejected' && styles.stepIconRejected,
                    item.status === 'pending' && styles.stepIconPending
                  )}
                >
                  <Text className={styles.stepEmoji}>{APPROVAL_ROLE_ICONS[item.role]}</Text>
                </View>
                {index < approval.approvals.length - 1 && (
                  <View className={classnames(styles.stepLine, item.status === 'approved' && styles.stepLineActive)} />
                )}
              </View>
              <View className={styles.stepContent}>
                <View className={styles.stepHeader}>
                  <Text className={styles.stepRole}>{APPROVAL_ROLE_LABELS[item.role]}</Text>
                  <Text className={styles.stepApprover}>{item.approverName}</Text>
                  <Text
                    className={classnames(
                      styles.stepStatus,
                      item.status === 'approved' && styles.stepStatusApproved,
                      item.status === 'rejected' && styles.stepStatusRejected,
                      item.status === 'pending' && styles.stepStatusPending
                    )}
                  >
                    {item.status === 'approved' ? '已通过' : item.status === 'rejected' ? '已否决' : '待审批'}
                  </Text>
                </View>
                {item.comment && (
                  <Text className={styles.stepComment}>审批意见：{item.comment}</Text>
                )}
                {item.timestamp && (
                  <Text className={styles.stepTime}>{item.timestamp}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {approval.overallStatus === 'rejected' && (
          <View className={styles.rejectNotice}>
            <Text className={styles.rejectNoticeText}>
              ❌ 一票否决！审批流程已终止。否决原因：{approval.approvals.find((a) => a.status === 'rejected')?.comment || '无'}
            </Text>
          </View>
        )}

        {approval.overallStatus === 'approved' && (
          <View className={styles.approveNotice}>
            <Text className={styles.approveNoticeText}>
              ✅ 全票通过！场馆预订已生效，所有审批环节均已确认。
            </Text>
          </View>
        )}
      </View>

      {approval.overallStatus === 'pending' && nextRole && (
        <View className={styles.bottomBar}>
          <View className={styles.rejectBtn} onClick={handleReject}>
            <Text className={styles.rejectBtnText}>一票否决</Text>
          </View>
          <View className={styles.approveBtn} onClick={handleApprove}>
            <Text className={styles.approveBtnText}>
              通过（{APPROVAL_ROLE_LABELS[nextRole]}）
            </Text>
          </View>
        </View>
      )}

      <View className={styles.footerCard}>
        <Text className={styles.footerText}>提交时间：{approval.createdAt}</Text>
      </View>
    </View>
  );
};

export default ApprovalDetailPage;

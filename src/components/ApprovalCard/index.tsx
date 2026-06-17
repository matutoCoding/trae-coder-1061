import React from 'react';
import { View, Text } from '@tarojs/components';
import { Approval, APPROVAL_ROLE_LABELS } from '@/types/approval';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface ApprovalCardProps {
  approval: Approval;
  onClick?: (id: string) => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ approval, onClick }) => {
  const statusConfig = {
    pending: { label: '审批中', color: '#F59E0B' },
    approved: { label: '已通过', color: '#10B981' },
    rejected: { label: '已否决', color: '#EF4444' },
  };

  const config = statusConfig[approval.overallStatus];
  const approvedCount = approval.approvals.filter((a) => a.status === 'approved').length;
  const totalCount = approval.approvals.length;

  return (
    <View className={styles.card} onClick={() => onClick?.(approval.id)}>
      <View className={styles.header}>
        <Text className={styles.title}>{approval.bookingTitle}</Text>
        <StatusTag status={approval.overallStatus} label={config.label} color={config.color} size="small" />
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.icon}>📅</Text>
          <Text className={styles.value}>{approval.date} {approval.startTime}-{approval.endTime}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.icon}>🏟️</Text>
          <Text className={styles.value}>{approval.venueTypeName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.icon}>👤</Text>
          <Text className={styles.value}>{approval.organizer}</Text>
        </View>
      </View>
      <View className={styles.progressRow}>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{
              width: `${(approvedCount / totalCount) * 100}%`,
              backgroundColor: approval.overallStatus === 'rejected' ? '#EF4444' : '#10B981',
            }}
          />
        </View>
        <Text className={styles.progressText}>
          {approvedCount}/{totalCount} 已通过
        </Text>
      </View>
      <View className={styles.approvers}>
        {approval.approvals.map((item) => (
          <View key={item.role} className={styles.approverItem}>
            <View
              className={styles.approverDot}
              style={{
                backgroundColor:
                  item.status === 'approved' ? '#10B981' : item.status === 'rejected' ? '#EF4444' : '#F59E0B',
              }}
            />
            <Text className={styles.approverText}>
              {APPROVAL_ROLE_LABELS[item.role]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ApprovalCard;

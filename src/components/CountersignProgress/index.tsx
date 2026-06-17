import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { ApprovalItem, APPROVAL_ROLE_LABELS, APPROVAL_ROLE_ICONS } from '@/types/approval';
import styles from './index.module.scss';

interface CountersignProgressProps {
  approvals: ApprovalItem[];
}

const CountersignProgress: React.FC<CountersignProgressProps> = ({ approvals }) => {
  const roles: Array<'venue_manager' | 'security' | 'finance'> = ['venue_manager', 'security', 'finance'];

  return (
    <View className={styles.container}>
      {roles.map((role, index) => {
        const item = approvals.find((a) => a.role === role);
        const status = item?.status || 'pending';
        const isLast = index === roles.length - 1;

        return (
          <View key={role} className={styles.roleWrapper}>
            <View className={styles.roleItem}>
              <View
                className={classnames(
                  styles.iconCircle,
                  status === 'approved' && styles.approved,
                  status === 'rejected' && styles.rejected,
                  status === 'pending' && styles.pending
                )}
              >
                <Text className={styles.roleIcon}>{APPROVAL_ROLE_ICONS[role]}</Text>
              </View>
              <Text className={styles.roleLabel}>{APPROVAL_ROLE_LABELS[role]}</Text>
              <Text
                className={classnames(
                  styles.statusText,
                  status === 'approved' && styles.statusTextApproved,
                  status === 'rejected' && styles.statusTextRejected,
                  status === 'pending' && styles.statusTextPending
                )}
              >
                {status === 'approved' ? '已通过' : status === 'rejected' ? '已否决' : '待审批'}
              </Text>
            </View>
            {!isLast && (
              <View
                className={classnames(
                  styles.connector,
                  status === 'approved' && styles.connectorApproved
                )}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default CountersignProgress;

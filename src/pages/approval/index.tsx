import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { Approval, APPROVAL_ROLE_LABELS, ApprovalRole } from '@/types/approval';
import StatusTag from '@/components/StatusTag';
import classnames from 'classnames';
import styles from './index.module.scss';

const ApprovalPage: React.FC = () => {
  const { approvals, approveItem, rejectItem } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const pendingList = approvals.filter((a) => a.overallStatus === 'pending');
  const completedList = approvals.filter((a) => a.overallStatus !== 'pending');

  const currentList = activeTab === 'pending' ? pendingList : completedList;

  const handleApprove = (approval: Approval, role: ApprovalRole) => {
    approveItem(approval.id, role);
    Taro.showToast({ title: '审批通过', icon: 'success' });
  };

  const handleReject = (approval: Approval, role: ApprovalRole) => {
    Taro.showModal({
      title: '否决确认',
      content: `确定要否决「${approval.bookingTitle}」的申请吗？一票否决将终止整个审批流程。`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          rejectItem(approval.id, role, '不同意');
          Taro.showToast({ title: '已否决', icon: 'none' });
        }
      },
    });
  };

  const getNextPendingRole = (approval: Approval): ApprovalRole | null => {
    const nextItem = approval.approvals.find((a) => a.status === 'pending');
    return nextItem ? nextItem.role : null;
  };

  const statusConfig = {
    pending: { label: '审批中', color: '#F59E0B' },
    approved: { label: '已通过', color: '#10B981' },
    rejected: { label: '已否决', color: '#EF4444' },
  };

  return (
    <View className={styles.container}>
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'pending' && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          <Text className={styles.tabText}>待审批</Text>
          {pendingList.length > 0 && (
            <View className={styles.badge}>
              <Text className={styles.badgeText}>{pendingList.length}</Text>
            </View>
          )}
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'completed' && styles.tabActive)}
          onClick={() => setActiveTab('completed')}
        >
          <Text className={styles.tabText}>已审批</Text>
        </View>
      </View>

      {currentList.length > 0 ? (
        <View className={styles.list}>
          {currentList.map((approval) => {
            const config = statusConfig[approval.overallStatus];
            const approvedCount = approval.approvals.filter((a) => a.status === 'approved').length;
            const totalCount = approval.approvals.length;
            const nextRole = getNextPendingRole(approval);

            return (
              <View key={approval.id} className={styles.card}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>{approval.bookingTitle}</Text>
                  <StatusTag status={approval.overallStatus} label={config.label} color={config.color} size="small" />
                </View>
                <View className={styles.cardBody}>
                  <View className={styles.cardRow}>
                    <Text className={styles.cardIcon}>📅</Text>
                    <Text className={styles.cardValue}>{approval.date} {approval.startTime}-{approval.endTime}</Text>
                  </View>
                  <View className={styles.cardRow}>
                    <Text className={styles.cardIcon}>🏟️</Text>
                    <Text className={styles.cardValue}>{approval.venueTypeName}</Text>
                  </View>
                  <View className={styles.cardRow}>
                    <Text className={styles.cardIcon}>👤</Text>
                    <Text className={styles.cardValue}>{approval.organizer}</Text>
                  </View>
                  <View className={styles.cardRow}>
                    <Text className={styles.cardIcon}>🛡️</Text>
                    <Text className={styles.cardValue}>安保 {approval.securityRequired} 人</Text>
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
                  <Text className={styles.progressText}>{approvedCount}/{totalCount}</Text>
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
                      <Text className={styles.approverText}>{APPROVAL_ROLE_LABELS[item.role]}</Text>
                    </View>
                  ))}
                </View>
                {approval.overallStatus === 'pending' && nextRole && (
                  <View className={styles.actions}>
                    <View className={styles.rejectBtn} onClick={() => handleReject(approval, nextRole)}>
                      <Text className={styles.rejectBtnText}>一票否决</Text>
                    </View>
                    <View className={styles.approveBtn} onClick={() => handleApprove(approval, nextRole)}>
                      <Text className={styles.approveBtnText}>通过</Text>
                    </View>
                  </View>
                )}
                {approval.overallStatus === 'rejected' && (
                  <View className={styles.approvers}>
                    {approval.approvals
                      .filter((a) => a.status === 'rejected')
                      .map((item) => (
                        <View key={item.role} className={styles.approverItem}>
                          <Text className={styles.approverText} style={{ color: '#EF4444' }}>
                            {APPROVAL_ROLE_LABELS[item.role]}否决：{item.comment || '无'}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>📋</Text>
          <View>
            <Text className={styles.emptyText}>
              {activeTab === 'pending' ? '暂无待审批项目' : '暂无已审批项目'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ApprovalPage;

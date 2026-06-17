import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { bookings, approvals } = useAppStore();

  const myBookingCount = bookings.filter((b) => b.status === 'pending_approval').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;
  const pendingApprovalCount = approvals.filter((a) => a.overallStatus === 'pending').length;

  const handleMyBookings = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleMyApprovals = () => {
    Taro.switchTab({ url: '/pages/approval/index' });
  };

  const handleMenuClick = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileCard}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>王建国</Text>
          <Text className={styles.profileRole}>场馆管理员</Text>
          <Text className={styles.profileDept}>全民健身中心运营部</Text>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{myBookingCount}</Text>
          <Text className={styles.statLabel}>待审批</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{approvedCount}</Text>
          <Text className={styles.statLabel}>已通过</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{pendingApprovalCount}</Text>
          <Text className={styles.statLabel}>审批中</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>预订管理</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleMyBookings}>
            <Text className={styles.menuItemIcon}>📋</Text>
            <Text className={styles.menuItemText}>我的预订</Text>
            <Text className={styles.menuItemArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleMenuClick}>
            <Text className={styles.menuItemIcon}>📊</Text>
            <Text className={styles.menuItemText}>预订记录</Text>
            <Text className={styles.menuItemArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>审批管理</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleMyApprovals}>
            <Text className={styles.menuItemIcon}>✅</Text>
            <Text className={styles.menuItemText}>我的审批</Text>
            <Text className={styles.menuItemArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleMenuClick}>
            <Text className={styles.menuItemIcon}>📜</Text>
            <Text className={styles.menuItemText}>审批记录</Text>
            <Text className={styles.menuItemArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>系统</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleMenuClick}>
            <Text className={styles.menuItemIcon}>ℹ️</Text>
            <Text className={styles.menuItemText}>关于我们</Text>
            <Text className={styles.menuItemArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleMenuClick}>
            <Text className={styles.menuItemIcon}>⚙️</Text>
            <Text className={styles.menuItemText}>系统设置</Text>
            <Text className={styles.menuItemArrow}>›</Text>
          </View>
        </View>
      </View>

      <Text className={styles.versionText}>全民健身中心 v1.0.0</Text>
    </View>
  );
};

export default MinePage;

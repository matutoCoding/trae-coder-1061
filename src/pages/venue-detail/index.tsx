import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const VenueDetailPage: React.FC = () => {
  return (
    <View className={styles.container}>
      <Text className={styles.icon}>🏟️</Text>
      <Text className={styles.title}>场馆详情</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  );
};

export default VenueDetailPage;

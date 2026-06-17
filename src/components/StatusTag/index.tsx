import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: string;
  label: string;
  color: string;
  size?: 'small' | 'normal';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, label, color, size = 'normal' }) => {
  return (
    <View
      className={classnames(styles.tag, size === 'small' && styles.tagSmall)}
      style={{ backgroundColor: `${color}15`, borderColor: `${color}40` }}
    >
      <View className={styles.dot} style={{ backgroundColor: color }} />
      <Text className={classnames(styles.text, size === 'small' && styles.textSmall)} style={{ color }}>
        {label}
      </Text>
    </View>
  );
};

export default StatusTag;

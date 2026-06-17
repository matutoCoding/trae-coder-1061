import React, { useState, useMemo } from 'react';
import { View, Text, Image, Picker, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { Venue, VenueType, VenueStatus, VENUE_TYPE_LIST, VENUE_TYPE_LABELS } from '@/types/venue';
import StatusTag from '@/components/StatusTag';
import classnames from 'classnames';
import styles from './index.module.scss';

const VenueListPage: React.FC = () => {
  const { venues } = useAppStore();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');

  const typeOptions = [{ value: 'all', label: '全部类型' }, ...VENUE_TYPE_LIST];
  const typeLabels = typeOptions.map((v) => v.label);

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'available', label: '空闲可用' },
    { value: 'occupied', label: '使用中' },
    { value: 'maintenance', label: '维护中' },
  ];
  const statusLabels = statusOptions.map((v) => v.label);

  const capacityOptions = [
    { value: 'all', label: '全部容量' },
    { value: '0-50', label: '50人以下' },
    { value: '50-100', label: '50-100人' },
    { value: '100-300', label: '100-300人' },
    { value: '300+', label: '300人以上' },
  ];
  const capacityLabels = capacityOptions.map((v) => v.label);

  const statusConfig: Record<VenueStatus, { label: string; color: string }> = {
    available: { label: '空闲', color: '#10B981' },
    occupied: { label: '使用中', color: '#F59E0B' },
    maintenance: { label: '维护中', color: '#EF4444' },
  };

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (typeFilter !== 'all' && venue.type !== typeFilter) return false;
      if (statusFilter !== 'all' && venue.status !== statusFilter) return false;

      if (capacityFilter !== 'all') {
        if (capacityFilter === '0-50' && venue.capacity >= 50) return false;
        if (capacityFilter === '50-100' && (venue.capacity < 50 || venue.capacity >= 100)) return false;
        if (capacityFilter === '100-300' && (venue.capacity < 100 || venue.capacity >= 300)) return false;
        if (capacityFilter === '300+' && venue.capacity < 300) return false;
      }

      return true;
    });
  }, [venues, typeFilter, statusFilter, capacityFilter]);

  const handleTypeChange = (e) => {
    const index = Number(e.detail.value);
    setTypeFilter(typeOptions[index].value);
  };

  const handleStatusChange = (e) => {
    const index = Number(e.detail.value);
    setStatusFilter(statusOptions[index].value);
  };

  const handleCapacityChange = (e) => {
    const index = Number(e.detail.value);
    setCapacityFilter(capacityOptions[index].value);
  };

  const handleVenueClick = (venue: Venue) => {
    Taro.navigateTo({ url: `/pages/venue-detail/index?id=${venue.id}` });
  };

  const getTypeIndex = () => typeOptions.findIndex((o) => o.value === typeFilter);
  const getStatusIndex = () => statusOptions.findIndex((o) => o.value === statusFilter);
  const getCapacityIndex = () => capacityOptions.findIndex((o) => o.value === capacityFilter);

  return (
    <View className={styles.container}>
      <View className={styles.filterBar}>
        <View className={styles.filterItem}>
          <Picker mode="selector" range={typeLabels} value={getTypeIndex()} onChange={handleTypeChange}>
            <View className={styles.filterTrigger}>
              <Text className={styles.filterText}>{typeLabels[getTypeIndex()]}</Text>
              <Text className={styles.filterArrow}>▼</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.filterItem}>
          <Picker mode="selector" range={statusLabels} value={getStatusIndex()} onChange={handleStatusChange}>
            <View className={styles.filterTrigger}>
              <Text className={styles.filterText}>{statusLabels[getStatusIndex()]}</Text>
              <Text className={styles.filterArrow}>▼</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.filterItem}>
          <Picker mode="selector" range={capacityLabels} value={getCapacityIndex()} onChange={handleCapacityChange}>
            <View className={styles.filterTrigger}>
              <Text className={styles.filterText}>{capacityLabels[getCapacityIndex()]}</Text>
              <Text className={styles.filterArrow}>▼</Text>
            </View>
          </Picker>
        </View>
      </View>

      <View className={styles.resultInfo}>
        <Text className={styles.resultCount}>共 {filteredVenues.length} 个场馆</Text>
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredVenues.map((venue) => (
          <View key={venue.id} className={styles.venueCard} onClick={() => handleVenueClick(venue)}>
            <Image className={styles.venueImage} src={venue.image} mode="aspectFill" />
            <View className={styles.venueInfo}>
              <View className={styles.venueHeader}>
                <Text className={styles.venueName}>{venue.name}</Text>
                <StatusTag
                  status={venue.status}
                  label={statusConfig[venue.status].label}
                  color={statusConfig[venue.status].color}
                  size="small"
                />
              </View>
              <View className={styles.venueMeta}>
                <Text className={styles.venueType}>{VENUE_TYPE_LABELS[venue.type]}</Text>
                <Text className={styles.venueDot}>·</Text>
                <Text className={styles.venueLocation}>📍 {venue.location}</Text>
              </View>
              <View className={styles.venueFooter}>
                <Text className={styles.venueCapacity}>👥 容纳 {venue.capacity} 人</Text>
                <Text className={styles.venuePrice}>
                  <Text className={styles.venuePriceNum}>¥{venue.hourlyRate}</Text>
                  <Text className={styles.venuePriceUnit}>/小时</Text>
                </Text>
              </View>
            </View>
          </View>
        ))}

        {filteredVenues.length === 0 && (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🔍</Text>
            <Text className={styles.emptyText}>暂无符合条件的场馆</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default VenueListPage;

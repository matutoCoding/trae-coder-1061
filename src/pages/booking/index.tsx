import React, { useState, useMemo } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { VENUE_TYPE_LIST } from '@/types/venue';
import { allocateVenue } from '@/utils/allocation';
import styles from './index.module.scss';

const calcMinSecurity = (attendees: number): number => {
  if (attendees <= 0) return 1;
  if (attendees <= 50) return 1;
  if (attendees <= 100) return 2;
  if (attendees <= 300) return 5;
  return 10;
};

const BookingPage: React.FC = () => {
  const { createBookingWithApproval } = useAppStore();

  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [venueTypeIndex, setVenueTypeIndex] = useState(0);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [securityRequired, setSecurityRequired] = useState('');
  const [allocatedVenue, setAllocatedVenue] = useState<{ name: string; location: string; capacity: number } | null>(null);
  const [allocationFailed, setAllocationFailed] = useState(false);

  const venueTypeLabels = VENUE_TYPE_LIST.map((v) => v.label);

  const attendeesNum = parseInt(expectedAttendees || '0', 10) || 0;
  const minSecurity = useMemo(() => calcMinSecurity(attendeesNum), [attendeesNum]);
  const securityNum = parseInt(securityRequired || '0', 10) || 0;
  const securityInsufficient = securityNum > 0 && securityNum < minSecurity;

  const handleAttendeesChange = (val: string) => {
    setExpectedAttendees(val);
    const num = parseInt(val || '0', 10) || 0;
    if (num > 0) {
      const suggested = calcMinSecurity(num);
      if (!securityRequired || parseInt(securityRequired, 10) < suggested) {
        setSecurityRequired(String(suggested));
      }
    }
  };

  const handleAllocate = () => {
    if (!date || !startTime || !endTime) {
      Taro.showToast({ title: '请先选择日期和时间', icon: 'none' });
      return;
    }
    if (startTime >= endTime) {
      Taro.showToast({ title: '结束时间须晚于开始时间', icon: 'none' });
      return;
    }

    const { venues, bookings } = useAppStore.getState();
    const selectedType = VENUE_TYPE_LIST[venueTypeIndex].value;
    const result = allocateVenue(venues, bookings, selectedType, date, startTime, endTime);

    if (result) {
      setAllocatedVenue({ name: result.name, location: result.location, capacity: result.capacity });
      setAllocationFailed(false);
      console.info('[Booking] Allocated venue:', result.name);
    } else {
      setAllocatedVenue(null);
      setAllocationFailed(true);
      console.info('[Booking] No available venue found');
    }
  };

  const handleSubmit = () => {
    if (!title || !organizer || !contactPhone || !expectedAttendees || !date || !startTime || !endTime || !purpose) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (!allocatedVenue) {
      Taro.showToast({ title: '请先进行智能分配', icon: 'none' });
      return;
    }
    if (securityInsufficient) {
      Taro.showModal({
        title: '安保人数不足',
        content: `当前活动预计${attendeesNum}人，最低需要${minSecurity}名安保人员，当前仅填写${securityNum}名。请补充安保人员后再提交。`,
        showCancel: false,
        confirmText: '返回修改',
      });
      return;
    }
    if (securityNum <= 0) {
      Taro.showModal({
        title: '安保人数未填写',
        content: `当前活动预计${attendeesNum}人，建议至少${minSecurity}名安保人员，请填写安保人数后提交。`,
        showCancel: false,
        confirmText: '返回修改',
      });
      return;
    }

    const result = createBookingWithApproval({
      title,
      organizer,
      contactPhone,
      expectedAttendees: parseInt(expectedAttendees, 10),
      venueType: VENUE_TYPE_LIST[venueTypeIndex].value,
      date,
      startTime,
      endTime,
      securityRequired: securityNum,
      purpose,
    });

    if (result) {
      Taro.showToast({ title: '预订提交成功', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/approval/index' });
      }, 1500);
    } else {
      Taro.showToast({ title: '暂无空闲场馆', icon: 'none' });
    }
  };

  const isFormValid = title && organizer && contactPhone && expectedAttendees && date && startTime && endTime && purpose && allocatedVenue && securityNum >= minSecurity;

  return (
    <View className={styles.container}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>活动信息
        </Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>活动名称</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入活动名称"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>承办方</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入承办方名称"
            value={organizer}
            onInput={(e) => setOrganizer(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>联系电话</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入联系电话"
            type="number"
            value={contactPhone}
            onInput={(e) => setContactPhone(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>预计人数</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入预计参与人数"
            type="number"
            value={expectedAttendees}
            onInput={(e) => handleAttendeesChange(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>活动说明</Text>
          <Input
            className={styles.formInput}
            placeholder="请简要说明活动用途"
            value={purpose}
            onInput={(e) => setPurpose(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏟️</Text>场馆与时间
        </Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>场馆类型（系统自动分配具体场馆）</Text>
          <Picker mode="selector" range={venueTypeLabels} value={venueTypeIndex} onChange={(e) => setVenueTypeIndex(Number(e.detail.value))}>
            <View className={styles.pickerTrigger}>
              <Text>{venueTypeLabels[venueTypeIndex]}</Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}><Text className={styles.required}>*</Text>使用日期</Text>
          <Picker mode="date" value={date} onChange={(e) => { setDate(e.detail.value); setAllocatedVenue(null); setAllocationFailed(false); }}>
            <View className={styles.pickerTrigger}>
              <Text className={!date ? styles.pickerPlaceholder : ''}>{date || '请选择日期'}</Text>
              <Text className={styles.pickerArrow}>▼</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.timeRow}>
          <View className={styles.timeCol}>
            <Text className={styles.formLabel}><Text className={styles.required}>*</Text>开始时间</Text>
            <Picker mode="time" value={startTime} onChange={(e) => { setStartTime(e.detail.value); setAllocatedVenue(null); setAllocationFailed(false); }}>
              <View className={styles.pickerTrigger}>
                <Text className={!startTime ? styles.pickerPlaceholder : ''}>{startTime || '开始'}</Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.timeCol}>
            <Text className={styles.formLabel}><Text className={styles.required}>*</Text>结束时间</Text>
            <Picker mode="time" value={endTime} onChange={(e) => { setEndTime(e.detail.value); setAllocatedVenue(null); setAllocationFailed(false); }}>
              <View className={styles.pickerTrigger}>
                <Text className={!endTime ? styles.pickerPlaceholder : ''}>{endTime || '结束'}</Text>
                <Text className={styles.pickerArrow}>▼</Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🛡️</Text>安保核定
        </Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>安保人员数量</Text>
          <Input
            className={classnames(styles.formInput, securityInsufficient && styles.formInputError)}
            placeholder="请输入安保人员数量"
            type="number"
            value={securityRequired}
            onInput={(e) => setSecurityRequired(e.detail.value)}
          />
        </View>

        {attendeesNum > 0 && (
          <View className={classnames(styles.securityTip, securityInsufficient ? styles.securityTipDanger : styles.securityTipInfo)}>
            <Text className={classnames(styles.securityTipText, securityInsufficient ? styles.securityTipTextDanger : styles.securityTipTextInfo)}>
              {securityInsufficient
                ? `⚠️ 当前${attendeesNum}人活动至少需${minSecurity}名安保，当前仅${securityNum}名，请补充后再提交`
                : `✅ 当前${attendeesNum}人活动建议至少${minSecurity}名安保人员（已满足）`
              }
            </Text>
          </View>
        )}

        {attendeesNum <= 0 && (
          <View className={styles.securityTip}>
            <Text className={styles.securityTipText}>
              安保人数标准：≤50人至少1名，51-100人至少2名，101-300人至少5名，300人以上至少10名
            </Text>
          </View>
        )}
      </View>

      <View className={styles.allocateSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🤖</Text>智能分配
        </Text>
        <Text className={styles.formLabel}>系统将根据场馆空闲情况和负载均衡自动择优分配</Text>

        <View className={styles.allocateBtn} onClick={handleAllocate}>
          <Text className={styles.allocateBtnText}>🔍 智能分配场馆</Text>
        </View>

        {allocatedVenue && (
          <View className={styles.allocateResult}>
            <Text className={styles.allocateResultTitle}>✅ 分配成功</Text>
            <View className={styles.allocateResultRow}>
              <Text className={styles.allocateResultIcon}>🏟️</Text>
              <Text className={styles.allocateResultText}>{allocatedVenue.name}</Text>
            </View>
            <View className={styles.allocateResultRow}>
              <Text className={styles.allocateResultIcon}>📍</Text>
              <Text className={styles.allocateResultText}>{allocatedVenue.location}</Text>
            </View>
            <View className={styles.allocateResultRow}>
              <Text className={styles.allocateResultIcon}>👥</Text>
              <Text className={styles.allocateResultText}>容纳 {allocatedVenue.capacity} 人</Text>
            </View>
          </View>
        )}

        {allocationFailed && (
          <View className={styles.allocateResultEmpty}>
            <Text className={styles.allocateResultEmptyText}>❌ 暂无空闲场馆，请调整时间或场馆类型</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.submitBtn, !isFormValid && styles.submitBtnDisabled)}
          onClick={isFormValid ? handleSubmit : undefined}
        >
          <Text className={styles.submitBtnText}>提交预订申请</Text>
        </View>
      </View>
    </View>
  );
};

export default BookingPage;

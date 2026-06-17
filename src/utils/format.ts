import dayjs from 'dayjs';

export const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY年MM月DD日');
};

export const formatDateShort = (date: string): string => {
  return dayjs(date).format('MM月DD日');
};

export const getWeekday = (date: string): string => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[dayjs(date).day()];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const formatTimeRange = (start: string, end: string): string => {
  return `${start}-${end}`;
};

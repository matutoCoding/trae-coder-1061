export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/booking/index',
    'pages/approval/index',
    'pages/mine/index',
    'pages/venue-detail/index',
    'pages/booking-detail/index',
    'pages/approval-detail/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0D9488',
    navigationBarTitleText: '全民健身中心',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#0D9488',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '排期',
      },
      {
        pagePath: 'pages/booking/index',
        text: '预订',
      },
      {
        pagePath: 'pages/approval/index',
        text: '审批',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
});

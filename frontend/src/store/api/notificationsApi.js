import { baseApi } from './baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/notifications?${searchParams}`;
      },
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    sendNotification: builder.mutation({
      query: (notificationData) => ({
        url: '/notifications/send',
        method: 'POST',
        body: notificationData,
      }),
      invalidatesTags: ['Notification'],
    }),
    getNotificationPreferences: builder.query({
      query: () => '/notifications/preferences',
      providesTags: ['Notification'],
    }),
    sendTestNotification: builder.mutation({
      query: (data) => ({
        url: '/notifications/test',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useSendNotificationMutation,
  useGetNotificationPreferencesQuery,
  useSendTestNotificationMutation,
} = notificationsApi;
import { baseApi } from './baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserDashboard: builder.query({
      query: () => '/users/dashboard',
      providesTags: ['User'],
    }),
    getUserStatistics: builder.query({
      query: () => '/users/statistics',
      providesTags: ['User'],
    }),
    getActivityHistory: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/users/activity-history?${searchParams}`;
      },
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserDashboardQuery,
  useGetUserStatisticsQuery,
  useGetActivityHistoryQuery,
} = usersApi;
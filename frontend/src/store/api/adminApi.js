import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),
    getAllAppointments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/admin/appointments?${searchParams}`;
      },
      providesTags: ['Admin', 'Appointment'],
    }),
    updateAppointmentStatus: builder.mutation({
      query: ({ id, ...statusData }) => ({
        url: `/admin/appointments/${id}/status`,
        method: 'PUT',
        body: statusData,
      }),
      invalidatesTags: ['Admin', 'Appointment'],
    }),
    getAllIncidents: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/admin/incidents?${searchParams}`;
      },
      providesTags: ['Admin', 'Incident'],
    }),
    updateIncidentStatus: builder.mutation({
      query: ({ id, ...statusData }) => ({
        url: `/admin/incidents/${id}/status`,
        method: 'PUT',
        body: statusData,
      }),
      invalidatesTags: ['Admin', 'Incident'],
    }),
    getAllUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/admin/users?${searchParams}`;
      },
      providesTags: ['Admin', 'User'],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: ['Admin', 'User'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAllAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useGetAllIncidentsQuery,
  useUpdateIncidentStatusMutation,
  useGetAllUsersQuery,
  useToggleUserStatusMutation,
} = adminApi;
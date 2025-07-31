import { baseApi } from './baseApi';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/appointments?${searchParams}`;
      },
      providesTags: ['Appointment'],
    }),
    getAppointment: builder.query({
      query: (id) => `/appointments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: '/appointments',
        method: 'POST',
        body: appointmentData,
      }),
      invalidatesTags: ['Appointment'],
    }),
    updateAppointment: builder.mutation({
      query: ({ id, ...appointmentData }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointmentData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Appointment', id }],
    }),
    cancelAppointment: builder.mutation({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),
    getUpcomingAppointments: builder.query({
      query: (hours = 72) => `/appointments/upcoming?hours=${hours}`,
      providesTags: ['Appointment'],
    }),
    getDueServiceReminders: builder.query({
      query: () => '/appointments/due-reminders',
      providesTags: ['Appointment', 'Vehicle'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
  useGetUpcomingAppointmentsQuery,
  useGetDueServiceRemindersQuery,
} = appointmentsApi;
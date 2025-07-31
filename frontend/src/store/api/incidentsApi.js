import { baseApi } from './baseApi';

export const incidentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncidents: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/incidents?${searchParams}`;
      },
      providesTags: ['Incident'],
    }),
    getIncident: builder.query({
      query: (id) => `/incidents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Incident', id }],
    }),
    createIncident: builder.mutation({
      query: (incidentData) => ({
        url: '/incidents',
        method: 'POST',
        body: incidentData,
      }),
      invalidatesTags: ['Incident'],
    }),
    updateIncident: builder.mutation({
      query: ({ id, ...incidentData }) => ({
        url: `/incidents/${id}`,
        method: 'PUT',
        body: incidentData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Incident', id }],
    }),
    deleteIncident: builder.mutation({
      query: (id) => ({
        url: `/incidents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Incident'],
    }),
    uploadIncidentMedia: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/incidents/${id}/upload`,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Incident', id }],
    }),
    updateIncidentLocation: builder.mutation({
      query: ({ id, ...locationData }) => ({
        url: `/incidents/${id}/location`,
        method: 'PUT',
        body: locationData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Incident', id }],
    }),
    getPublicIncidents: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/incidents/public?${searchParams}`;
      },
      providesTags: ['Incident'],
    }),
  }),
});

export const {
  useGetIncidentsQuery,
  useGetIncidentQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
  useUploadIncidentMediaMutation,
  useUpdateIncidentLocationMutation,
  useGetPublicIncidentsQuery,
} = incidentsApi;
import { baseApi } from './baseApi';

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return `/services?${searchParams}`;
      },
      providesTags: ['Service'],
    }),
    getService: builder.query({
      query: (id) => `/services/${id}`,
      providesTags: (result, error, id) => [{ type: 'Service', id }],
    }),
    createService: builder.mutation({
      query: (serviceData) => ({
        url: '/services',
        method: 'POST',
        body: serviceData,
      }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation({
      query: ({ id, ...serviceData }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: serviceData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Service', id }],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
    addServicePart: builder.mutation({
      query: ({ serviceId, ...partData }) => ({
        url: `/services/${serviceId}/parts`,
        method: 'POST',
        body: partData,
      }),
      invalidatesTags: (result, error, { serviceId }) => [{ type: 'Service', id: serviceId }],
    }),
    updateServicePart: builder.mutation({
      query: ({ id, ...partData }) => ({
        url: `/services/parts/${id}`,
        method: 'PUT',
        body: partData,
      }),
      invalidatesTags: ['Service'],
    }),
    deleteServicePart: builder.mutation({
      query: (id) => ({
        url: `/services/parts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
    getServiceCategories: builder.query({
      query: () => '/services/categories',
      providesTags: ['Service'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useAddServicePartMutation,
  useUpdateServicePartMutation,
  useDeleteServicePartMutation,
  useGetServiceCategoriesQuery,
} = servicesApi;
import { baseApi } from './baseApi';

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query({
      query: () => '/vehicles',
      providesTags: ['Vehicle'],
    }),
    getVehicle: builder.query({
      query: (id) => `/vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vehicle', id }],
    }),
    createVehicle: builder.mutation({
      query: (vehicleData) => ({
        url: '/vehicles',
        method: 'POST',
        body: vehicleData,
      }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: builder.mutation({
      query: ({ id, ...vehicleData }) => ({
        url: `/vehicles/${id}`,
        method: 'PUT',
        body: vehicleData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
    }),
    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),
    updateMileage: builder.mutation({
      query: ({ id, mileage }) => ({
        url: `/vehicles/${id}/mileage`,
        method: 'PUT',
        body: { mileage },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vehicle', id }],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useUpdateMileageMutation,
} = vehiclesApi;
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Incident Reports Slice
const incidentReportsSlice = createSlice({
  name: 'incidentReports',
  initialState: {
    reports: [],
    loading: false,
    error: null,
    currentReport: null,
  },
  reducers: {
    fetchReportsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchReportsSuccess: (state, action) => {
      state.loading = false;
      state.reports = action.payload;
      state.error = null;
    },
    fetchReportsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addReport: (state, action) => {
      state.reports.push(action.payload);
    },
    updateReport: (state, action) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    deleteReport: (state, action) => {
      state.reports = state.reports.filter(report => report.id !== action.payload);
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
  },
});

// Vehicles Slice
const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState: {
    vehicles: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchVehiclesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVehiclesSuccess: (state, action) => {
      state.loading = false;
      state.vehicles = action.payload;
      state.error = null;
    },
    fetchVehiclesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addVehicle: (state, action) => {
      state.vehicles.push(action.payload);
    },
    updateVehicle: (state, action) => {
      const index = state.vehicles.findIndex(vehicle => vehicle.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    },
  },
});

// Services Slice
const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    services: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchServicesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action) => {
      state.loading = false;
      state.services = action.payload;
      state.error = null;
    },
    fetchServicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addService: (state, action) => {
      state.services.push(action.payload);
    },
  },
});

// Appointments Slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchAppointmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.loading = false;
      state.appointments = action.payload;
      state.error = null;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
  },
});

// Parts Slice
const partsSlice = createSlice({
  name: 'parts',
  initialState: {
    parts: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchPartsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPartsSuccess: (state, action) => {
      state.loading = false;
      state.parts = action.payload;
      state.error = null;
    },
    fetchPartsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addPart: (state, action) => {
      state.parts.push(action.payload);
    },
    updatePart: (state, action) => {
      const index = state.parts.findIndex(part => part.id === action.payload.id);
      if (index !== -1) {
        state.parts[index] = action.payload;
      }
    },
  },
});

// Export actions
export const authActions = authSlice.actions;
export const incidentReportsActions = incidentReportsSlice.actions;
export const vehiclesActions = vehiclesSlice.actions;
export const servicesActions = servicesSlice.actions;
export const appointmentsActions = appointmentsSlice.actions;
export const partsActions = partsSlice.actions;

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    incidentReports: incidentReportsSlice.reducer,
    vehicles: vehiclesSlice.reducer,
    services: servicesSlice.reducer,
    appointments: appointmentsSlice.reducer,
    parts: partsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
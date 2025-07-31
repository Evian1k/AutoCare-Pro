import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import API slices
import { authApi } from './api/authApi';
import { vehiclesApi } from './api/vehiclesApi';
import { servicesApi } from './api/servicesApi';
import { appointmentsApi } from './api/appointmentsApi';
import { incidentsApi } from './api/incidentsApi';
import { notificationsApi } from './api/notificationsApi';
import { adminApi } from './api/adminApi';
import { usersApi } from './api/usersApi';

// Import feature slices
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [authApi.reducerPath]: authApi.reducer,
  [vehiclesApi.reducerPath]: vehiclesApi.reducer,
  [servicesApi.reducerPath]: servicesApi.reducer,
  [appointmentsApi.reducerPath]: appointmentsApi.reducer,
  [incidentsApi.reducerPath]: incidentsApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authApi.middleware,
      vehiclesApi.middleware,
      servicesApi.middleware,
      appointmentsApi.middleware,
      incidentsApi.middleware,
      notificationsApi.middleware,
      adminApi.middleware,
      usersApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
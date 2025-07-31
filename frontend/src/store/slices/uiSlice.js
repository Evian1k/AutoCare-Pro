import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  toast: {
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = null;
    },
    showToast: (state, action) => {
      state.toast.show = true;
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type || 'info';
    },
    hideToast: (state) => {
      state.toast.show = false;
      state.toast.message = '';
      state.toast.type = 'info';
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLoading,
  openModal,
  closeModal,
  showToast,
  hideToast,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectLoading = (state) => state.ui.loading;
export const selectModal = (state) => state.ui.modal;
export const selectToast = (state) => state.ui.toast;
export const selectNotifications = (state) => state.ui.notifications;

export default uiSlice.reducer;
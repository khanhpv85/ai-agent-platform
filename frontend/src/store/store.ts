import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authSlice, companySlice, agentsSlice, workflowsSlice } from './reducers';

// Persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'expiresIn', 'refreshExpiresIn', 'isAuthenticated'],
};

// Persist configuration for company
const companyPersistConfig = {
  key: 'company',
  storage,
  whitelist: ['currentCompany'],
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);
const persistedCompanyReducer = persistReducer(companyPersistConfig, companySlice.reducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    company: persistedCompanyReducer,
    agents: agentsSlice.reducer,
    workflows: workflowsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import queueReducer from './slices/queueSlice'
import patientReducer from './slices/patientSlice'

const store = configureStore({
  reducer: {
    app: appReducer,
    queue: queueReducer,
    patient: patientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['patient/setSelectedPatient'],
      },
    }),
})

export default store
export { store }

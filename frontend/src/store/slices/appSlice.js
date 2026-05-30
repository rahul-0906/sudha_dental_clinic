import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isNurseAvailable: localStorage.getItem('isNurseAvailable') === 'true',
  isAuthenticated: false,
  activeView: localStorage.getItem('activeView') || 'dashboard',
  lowStockCount: 0,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setNurseMode: (state, action) => {
      state.isNurseAvailable = action.payload
      localStorage.setItem('isNurseAvailable', action.payload)
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setActiveView: (state, action) => {
      state.activeView = action.payload
      localStorage.setItem('activeView', action.payload)
    },
    setLowStockCount: (state, action) => {
      state.lowStockCount = action.payload
    },
  },
})

export const { setNurseMode, setAuthenticated, setActiveView, setLowStockCount } = appSlice.actions
export default appSlice.reducer

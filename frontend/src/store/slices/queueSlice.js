import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getTodayQueue, updateVisitStatus as apiUpdateStatus, checkoutVisit as apiCheckoutVisit } from '../../api/visits'
import toast from 'react-hot-toast'

export const fetchTodayQueue = createAsyncThunk(
  'queue/fetchTodayQueue',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTodayQueue()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load queue')
    }
  }
)

export const updateVisitStatus = createAsyncThunk(
  'queue/updateVisitStatus',
  async ({ id, visitId, status }, { rejectWithValue }) => {
    try {
      const visitIdToUse = id || visitId
      const res = await apiUpdateStatus(visitIdToUse, status)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status')
    }
  }
)

export const checkoutVisit = createAsyncThunk(
  'queue/checkoutVisit',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiCheckoutVisit(data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Checkout failed')
    }
  }
)

const queueSlice = createSlice({
  name: 'queue',
  initialState: {
    queue: [],
    loading: false,
    error: null,
    checkoutLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addVisitToQueue: (state, action) => {
      state.queue.push(action.payload)
    },
    removeFromQueue: (state, action) => {
      state.queue = state.queue.filter(v => v.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTodayQueue
      .addCase(fetchTodayQueue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTodayQueue.fulfilled, (state, action) => {
        state.loading = false
        state.queue = action.payload
      })
      .addCase(fetchTodayQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || 'Failed to load queue')
      })
      // updateVisitStatus
      .addCase(updateVisitStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(updateVisitStatus.fulfilled, (state, action) => {
        state.loading = false
        const updated = action.payload
        const idx = state.queue.findIndex(v => v.id === updated.id)
        if (idx !== -1) {
          state.queue[idx] = updated
        }
      })
      .addCase(updateVisitStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || 'Failed to update status')
      })
      // checkoutVisit
      .addCase(checkoutVisit.pending, (state) => {
        state.checkoutLoading = true
      })
      .addCase(checkoutVisit.fulfilled, (state, action) => {
        state.checkoutLoading = false
        const updated = action.payload
        const idx = state.queue.findIndex(v => v.id === updated.id)
        if (idx !== -1) {
          state.queue[idx] = updated
        }
        toast.success('✅ Checkout complete!')
      })
      .addCase(checkoutVisit.rejected, (state, action) => {
        state.checkoutLoading = false
        state.error = action.payload
        toast.error(action.payload || 'Checkout failed')
      })
  },
})

export const { clearError, addVisitToQueue, removeFromQueue } = queueSlice.actions
export { updateVisitStatus as updateVisitStatusThunk }
export default queueSlice.reducer

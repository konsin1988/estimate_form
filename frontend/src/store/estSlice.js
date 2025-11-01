import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

export const saveEst = createAsyncThunk(
    "estimate/saveEst",
    async (estData, { rejectWithValue }) => {
	try {
	    const response = await api.put('/est/save/', estData);
	    console.log(response.data)
	    return response.data;
	} catch(err) {
	    return rejectWithValue(err.response?.data?.detail || err.message);
	}
    }
)

const estSlice = createSlice({
    name: "estimate",
    initialState: { 
	data: {},
	loading: false,
	error: null,
    },
    reducers: {
	updateField: (state, action) => {
	    const { id, field, value } = action.payload;
	},
    },
    extraRedusers: (builder) => {
	builder
      .addCase(saveEst.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveEst.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(saveEst.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    },
});

export const { updateField } = estSlice.actions;
export default estSlice.reducer;
























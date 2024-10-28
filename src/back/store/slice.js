import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    name: '',
    weight: 0,
    prizes: []
}

export const fortuneSlice = createSlice({
    name: 'fortune',
    initialState,
    reducers:{
        setSliceName: (state, action)=>{
            state.name=action.payload
        },
        setSliceWeight: (state, action)=>{
            state.weight=action.payload
        },
        setSlicePrizes: (state, action)=>{
            state.prizes = action.payload.split(' ')
            
        }

    }
})

export const {setSliceName, setSliceWeight, setSlicePrizes} = fortuneSlice.actions
export default fortuneSlice.reducer
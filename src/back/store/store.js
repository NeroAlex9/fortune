import { configureStore } from "@reduxjs/toolkit";
import fortuneReducer from "./slice"

export const store = configureStore({
    reducer: {
        fortune: fortuneReducer
    }
})
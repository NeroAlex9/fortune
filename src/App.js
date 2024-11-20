import Game from "./pages/Game/Game";
import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home/Home";
import Input from "./back/Input";

function App() {
  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="/home" element = {<Home/>} />
                <Route path="/settings" element={<Input/>} />
                <Route path="/" element = {<Game/>} />
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;

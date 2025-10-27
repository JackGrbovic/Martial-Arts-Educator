import React, {useEffect, useState, useLayoutEffect} from "react";
import './style.css';
import { AppContext, User, AppProvider } from "./AppContext.tsx";
import { Outlet } from "react-router-dom";

function App(){
  return(
    <div className="app-background-fill" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <AppProvider>
        <Outlet />
      </AppProvider>
    </div>
  )
}

export default App;

import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Swap from './components/Swap';
import Pools from './components/Pools';
import { useDispatch, useSelector } from 'react-redux';
import {login, logout} from './redux/userSlice'
function App() {
  const chainId="0x13881";
  const user=useSelector(state=>state.user.user)
  const dispatch=useDispatch();
  window.ethereum.on('accountsChanged', ()=>{
    dispatch(logout());
    window.ethereum.request({method: "eth_requestAccounts"}).catch(err=>{}).then(res=>{
        if(res){
          dispatch(login(res[0]));

        }
    })
})
window.ethereum.on('chainChanged', (r)=>{
   dispatch(logout());
   if (r===chainId){
    window.ethereum.request({method: "eth_requestAccounts"}).catch(err=>{}).then(res=>{
        if(res){
          dispatch(login(res[0]));
        }
    })
   } else {
    window.ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chainId}]}).catch(err=>{}).then(()=>{
      window.ethereum.request({method: "eth_requestAccounts"}).catch(err=>{}).then(res=>{
        if (res){
          if (window.ethereum.networkVersion === chainId){
            dispatch(login(res[0]))
        }
        }
      })
    })
   }
})
    useEffect(()=>{
      window.ethereum.request({method: "eth_requestAccounts"}).catch(err=>{}).then(res=>{
       if(res){
        dispatch(login(res[0]));
       }
    })
    },[])
  return (
    <BrowserRouter>
    <Header/>
       <div>
         <Routes>
            <Route exact path="/" element={<Swap />} />
            <Route exact path="/pools" element={<Pools />} />
         </Routes>
       </div>
    </BrowserRouter>
  );
}

export default App;

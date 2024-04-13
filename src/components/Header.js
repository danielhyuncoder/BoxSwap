import React from 'react'
import '../css/Header.css'
import { useNavigate } from 'react-router-dom'
const Header = () => {
    const navigate=useNavigate();
  return (
    <div className="headerContainer">
        <div className="innerHead">
           <h2>BoxSwap</h2>
           <div className="navbtnRow">
              <button onClick={()=>navigate("/")}>
                  Swap
              </button>
              <button onClick={()=>navigate("/pools")}>
                  Pools
              </button>
           </div>
        </div>
    </div>
  )
}

export default Header
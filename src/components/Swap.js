import React, {useState, useEffect} from 'react'
import '../css/Swap.css'
import {ethers} from 'ethers'
import liquidityPool from '../addresses'
import LP from '../abis/Liquidity.json'
import Token from '../abis/Token.json'
import { useSelector } from 'react-redux'
const Swap = () => {

  const user=useSelector(state=>state.user.user)
  const[contract, setContract ] = useState(null);
  const[options, setOptions] = useState([]);
  const[token1, setToken1] = useState(null);
  const[token2, setToken2] = useState(null);
  const[valid,setValid]=useState(null);
  const[exchange, setExchange]=useState(0);
  const[amount1, setAmount1] = useState(0);
  const[msg,setMsg]=useState(null);
  const[rate, setRate]=useState(null);
  const[access,setAccess]=useState(null);
  async function setup(){
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const cont = new ethers.Contract(liquidityPool, LP, signer);

    const getPools=await cont.getPools();
    let arr = [];
    let hmap = {};
    getPools.map(pool=>{
        if (!hmap[pool[0]])arr.push({address: pool[0], symbol: pool[4]});
        if (!hmap[pool[1]]) arr.push({address: pool[1], symbol: pool[5]});
        hmap[pool[0]]=true;
        hmap[pool[1]]=true;

    })
    setOptions(arr)

    setContract(cont);
  }
  const validate = async () => {
      if (token1 && token2){
          let res1 = await contract.poolInd(token1, token2);
          let res2 = await contract.poolInd(token2, token1);
          res1=parseInt(res1);
          res2=parseInt(res2)
          if (res1 !== 0){
              const details=await contract.getPriceOf(token1, token2);
              setRate((parseInt(details[3])/parseInt(details[2])))
              setExchange(amount1*(parseInt(details[3])/parseInt(details[2])))
              setValid(details);
              if (amount1>parseInt(details[2])/1e6){
                setMsg("Warning: You are Swapping More Than What The Pool Can Handle.");
                setValid(null);
                return;
              } else {
                setMsg(null);
              }
          } else if (res2 !== 0){
            const details=await contract.getPriceOf(token2, token1);
            if (amount1>parseInt(details[3])/1e6){
              setMsg("Warning: You are Swapping More Than What The Pool Can Handle.");
              setValid(null);
              return;
            } else {
              setMsg(null);
            }
            setRate((parseInt(details[2])/parseInt(details[3])));
            setExchange(amount1*(parseInt(details[2])/parseInt(details[3])))
            setValid(details);
          }else {
            setValid(null)
            setMsg(null);
            setRate(null);
            setExchange(0);
          }
      } else {
        setRate(null);
        setValid(null);
        setExchange(0);
        setMsg(null);
      }
  }
  async function swap(){
      if (token1 && token2){
          const prov= new ethers.BrowserProvider(window.ethereum);
          const signer = await prov.getSigner();
          const token1contract = new ethers.Contract(token1, Token, signer);
          const bal1 = await token1contract.balanceOf(user);
          if (parseInt(bal1)/1e6<amount1){
              alert("Insufficient Funds.");return;
          } 
          
           contract.swapTokens(token1, token2, (amount1*1e6).toString()).catch(err=>{});
      } else {
        alert ("Token 1 or Token 2 Is Invalid.")
      }
  }
  async function checkAccess(){
    try {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const signer = await prov.getSigner();

        const t1 = new ethers.Contract(token1, Token, signer);

        const hasA=await t1.addrHasAccess(user, liquidityPool);
        setAccess(hasA);
    } catch(err){

    }
  }
  async function approveSpending(){
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const signer = await prov.getSigner();

      const t1 = new ethers.Contract(token1, Token, signer);
      await t1.addAccess(liquidityPool);
    } catch(err){

    }
  }

  useEffect(()=>{
   setup()
     validate();
     if (token1){
        checkAccess();
     }
     if (rate){
      setExchange(amount1*rate)
     } else {
      setExchange(0);
     }
  }, [token1, token2, amount1])
  return (
    <div className="swapContainer">

       <div className="innerSwap">
        <h2 className="bb">You Pay: </h2>
           <div className="swapRow">
           <select onChange={(e)=>{
              setToken1(e.target.value)
              
           }}>
            <option value={null}></option>
           {options.map(option=>{
                 let renderStr=option.symbol + " - " + option.address;
                 return (
                  <option value={option.address}>{renderStr}</option>
                 )  
              })}
           </select>
           <input onChange={(e)=>{
               setAmount1(e.target.value)
           }} placeholder="Amount"/>
           </div>
           <br />
           <h2 className="bb">You Recieve: </h2>
           <div className="swapRow">
           <select onChange={(e)=>{
              setToken2(e.target.value)
              
           }}>
            <option value={null}></option>
           {options.map(option=>{
                 let renderStr=option.symbol + " - " + option.address;
                 return (
                  <option value={option.address}>{renderStr}</option>
                 )  
              })}
           </select>
           <input placeholder="Recieved..." value={exchange} disabled/>
           </div>
           <br/>
           {access?(
             <p className="g">Approved for Spending</p>
           ):( 
              <>
                 {valid ? (
                    <button onClick={()=>{
                      approveSpending();
                    }}>Approve For Spending</button>
                 ) : (
                  <></>
                 )}
              </>
           )}
           <br/>
           {valid ? (
            <button onClick={()=>swap()} className="swapEnabled">Swap</button>
           ) : (
             <button className="swapDisabled" disabled>Swap</button>
           )}
           <br />
           {msg?(
            <p>{msg}</p>
           ) : (
             <></>
           )}
       </div>
    </div>
  )
}

export default Swap
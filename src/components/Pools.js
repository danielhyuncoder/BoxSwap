import React, {useState,useEffect} from 'react'
import '../css/Pools.css'
import { ethers } from 'ethers';
import liquidityPool from '../addresses';
import LiquidityPool from '../abis/Liquidity.json'
import Token from '../abis/Token.json'
import { useSelector } from 'react-redux';
const Pools = () => {
    const user=useSelector(state=>state.user.user)
  const [pools, setPools] = useState([]);
  const [filter,setFilter]=useState(false);
  const[modal, setModal]=useState(false);
  const[tokenaddr1, setTokenAddr1] = useState(null);
  const[amount1, setAmount1]=useState(0);
  const[tokenaddr2, setTokenAddr2] = useState(null);
  const[amount2, setAmount2]=useState(0);

  const[access1,setAccess1]=useState(null);
  const[access2, setAccess2]=useState(null);
  const [getSigner, setGetSigner]=useState(null);

  const [msg,setMsg]=useState("");
  const [msg2,setMsg2]=useState("");
  const setup = async()=>{
     const provider = new ethers.BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();
     setGetSigner(signer)
     const contract = new ethers.Contract(liquidityPool, LiquidityPool, signer);

     const data = await contract.getPools();
     setPools(data);
  }
  const checkToken1Validity = async()=>{
    try{
        const provider = new ethers.BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();
     
        const contract = new ethers.Contract(tokenaddr1, Token,signer);
        const hasAccess=await contract.addrHasAccess(user,liquidityPool);
        const name = await contract.name();
        const symbol = await contract.symbol();
        
        setAccess1(hasAccess);
        setMsg("Detected as : " + name + "("+symbol+")")

    }catch(err){
        setAccess1(null);
        setMsg("")
    }
  }
  const checkToken2Validity = async()=>{
    try{
        const provider = new ethers.BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();
     
        const contract = new ethers.Contract(tokenaddr2, Token,signer);
        const hasAccess=await contract.addrHasAccess(user,liquidityPool);
        const name = await contract.name();
        const symbol = await contract.symbol();
        setAccess2(hasAccess);
        setMsg2("Detected as : " + name + "("+symbol+")")
    }catch(err){
        setAccess2(null);
        setMsg2("")
    }
  }
  async function allowSpending(addr){
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(addr, Token,signer);

        contract.addAccess(liquidityPool).catch(err=>{}).then();
      } catch (err){
         alert("Token Contract is Invalid.")
      }
  }
  async function addLiquidity(){
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(liquidityPool, LiquidityPool, signer);
        const token1cont=new ethers.Contract(tokenaddr1, Token, signer);
        const token2cont=new ethers.Contract(tokenaddr2, Token, signer);
        const bal = await token1cont.balanceOf(user);
        const bal2 = await token2cont.balanceOf(user);
        if (parseInt(bal)<(amount1*1e6)||parseInt(bal2)<(amount2*1e6)) {
            alert("Insuficient Funds!");
            return;
        }
        contract.addLiquidity(tokenaddr1,tokenaddr2,(amount1*1e6).toString(), (amount2*1e6).toString()) 
  }
  useEffect(()=>{
        setup()
      checkToken1Validity();
      checkToken2Validity();
  }, [tokenaddr1,tokenaddr2])
  return (
    <>
       {modal ? (
            <div className="modal">
               <div className="innerModal">
                  <div className="innerContent">
                    <button className="jr" onClick={()=>{
                        setModal(false)
                        setMsg("");
                        setMsg2("");
                        setAmount1(0);
                        setAmount2(0);
                        setAccess1(null);
                        setAccess2(null);
                        setTokenAddr1(null);
                        setTokenAddr2(null);
                    }}>X</button>
                    <h2>Add Liquidity</h2>
                    <br/>
                    <input onChange={(e)=>{
                        setTokenAddr1(e.target.value)
                    }} placeholder="Token 1: 0x0000000"/>
                    {msg.length===0?(
                        <></>
                    ) : (
                        <p className="b">{msg}</p>
                    )}
                    <br/>
                    <input onChange={(e)=>{
                        setAmount1(e.target.value)
                    }} placeholder="Amount"/>
                    <br/>
                    {access1?(
                        <p className="g">Approved for Spending</p>
                    ) : (
                        <button className="approveBtn" onClick={()=>{
                            allowSpending(tokenaddr1)
                        }}>Allow Access for Spending</button>
                    )}
                    <br/>
                    <input onChange={(e)=>{
                        setTokenAddr2(e.target.value)
                    }} placeholder="Token 2: 0x0000000"/>
                    {msg2.length===0?(
                        <></>
                    ) : (
                        <p className="b">{msg2}</p>
                    )}
                    <br/>
                    <input onChange={(e)=>{
                        setAmount2(e.target.value)
                    }} placeholder="Amount"/>
                    <br />
                    {access2?(
                        <p className="g">Approved for Spending</p>
                    ) : (
                        <button className="approveBtn" onClick={()=>{
                            allowSpending(tokenaddr2)
                        }}>Allow Access for Spending</button>
                    )}
                    <br/>
                    {access2&&access1 ? (
                        <button className="approveBtn" onClick={()=>{
                           addLiquidity();
                        }}>
                        Add Liquidity
                        </button>
                    ) : (
                        <button className="altBtn" disabled>
                        Add Liquidity
                    </button>
                    )}
                  </div>
               </div>
            </div>
        ):(<></>)}
    <div className="poolContainer">
            <button className="newbtn" onClick={()=>setModal(true)}>
                Add Liquidity
            </button>
        <div className="poolList">
           <>
              {pools.map(pool=>(
                 <div className="pool">
                     <div>
                     <h2>Pair: ({pool[4]}) - ({pool[5]})</h2>
                     <h4>Total {pool[4]} Staked: ${parseInt(pool[2])/1e6}</h4>
                     <h4>Total {pool[5]} Staked: ${parseInt(pool[3])/1e6}</h4>
                     <p>{pool[4]} : {pool[0]} - {pool[5]} : {pool[1]}</p>
                     </div>
                 </div>
              ))}
           </>
        </div>
    </div>
    </>
  )
}

export default Pools
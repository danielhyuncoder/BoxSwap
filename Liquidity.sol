// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface ERC{
    function addressHasAccess(address a) external returns(bool);
    function transferThroughCustodian(address a, uint256 val) external;
    function transfer(address to, uint256 val) external;
    function balanceOf(address a) external view returns(uint256);
    function symbol() external view returns (string memory);
}


contract LiquidityPool{
    struct userPools{
        address token1;
        address token2;
        uint256 totalToken1;
        uint256 totalToken2;
        string symbol1;
        string symbol2;
    }
    mapping(address=>uint[]) public aPools;
    userPools[] pools;
    mapping(uint=>mapping(address=>uint256[2])) public userPoolBalances;
    mapping(address=>mapping(address=>uint)) public poolInd;
    uint32 currentIndex=1;
    function getPriceOf(address a, address b) public view returns (userPools memory){
        return pools[poolInd[a][b]-1];
    }
    function getPools()public view returns(userPools[] memory){
        return pools;
    }
    function addLiquidity(address token1, address token2,uint256 val1, uint256 val2) public {
        ERC contract1=ERC(token1);
        ERC contract2=ERC(token2);
        if(contract1.addressHasAccess(msg.sender)&&contract2.addressHasAccess(msg.sender)&&contract1.balanceOf(msg.sender)>=val1&&contract2.balanceOf(msg.sender)>=val2){
            contract1.transferThroughCustodian(msg.sender, val1);
            contract2.transferThroughCustodian(msg.sender, val2);
            if (poolInd[token1][token2]!=0){
                userPoolBalances[currentIndex-1][msg.sender][0]+=val1;
                userPoolBalances[currentIndex-1][msg.sender][1]+=val2;

                pools[poolInd[token1][token2]-1].totalToken1+=val1;
                pools[poolInd[token1][token2]-1].totalToken2+=val2;
            } else if (poolInd[token2][token1]!=0){
                userPoolBalances[currentIndex-1][msg.sender][0]+=val2;
                userPoolBalances[currentIndex-1][msg.sender][1]+=val1;

                pools[poolInd[token2][token1]-1].totalToken1+=val2;
                pools[poolInd[token2][token1]-1].totalToken2+=val1;
            } else {
                userPools memory pool = userPools(token1, token2, val1, val2,contract1.symbol(), contract2.symbol());
                pools.push(pool);
                poolInd[token1][token2]=currentIndex;
                currentIndex++;
                userPoolBalances[currentIndex-1][msg.sender][0]+=val1;
                userPoolBalances[currentIndex-1][msg.sender][1]+=val2;
            }
            
        }
    }
    function swapTokens(address token1, address token2, uint256 val) public payable{
        ERC contract1=ERC(token1);
        ERC contract2=ERC(token2);
        if (poolInd[token1][token2]!=0){
            if (contract1.addressHasAccess(msg.sender)&&contract1.balanceOf(msg.sender)>=val) {
                 uint256 tokens = (pools[poolInd[token1][token2]-1].totalToken2*val)/pools[poolInd[token1][token2]-1].totalToken1;
                 
                 contract1.transferThroughCustodian(msg.sender,val);
                 contract2.transfer(msg.sender,tokens);
                 pools[poolInd[token1][token2]-1].totalToken1+=val;
                 pools[poolInd[token1][token2]-1].totalToken2-=tokens;
            }
            } else if (poolInd[token2][token1]!=0){
                if (contract1.addressHasAccess(msg.sender)&&contract1.balanceOf(msg.sender)>=val) {
                 uint256 tokens = (pools[poolInd[token2][token1]-1].totalToken1*val)/pools[poolInd[token2][token1]-1].totalToken2;
                 contract1.transferThroughCustodian(msg.sender,val);
                 contract2.transfer(msg.sender,tokens);
                   pools[poolInd[token2][token1]-1].totalToken2+=val;
                 pools[poolInd[token2][token1]-1].totalToken1-=tokens;

                }
            } 
    }
    function removeLiquidity(address token1, address token2) public {
        /*
            Ratio of the user balances over the respective tokens
            re-balance the ratios out if exceeds.
            Total Ratio (With token1/token2).

        
        */
        
        ERC contract1=ERC(token1);
        ERC contract2=ERC(token2);
        if (poolInd[token1][token2]!=0){
            pools[poolInd[token1][token2]-1].totalToken1-=userPoolBalances[currentIndex-1][msg.sender][0];
            pools[poolInd[token1][token2]-1].totalToken2-=userPoolBalances[currentIndex-1][msg.sender][1];
            

            contract1.transfer(msg.sender, userPoolBalances[currentIndex-1][msg.sender][0]);
            contract2.transfer(msg.sender, userPoolBalances[currentIndex-1][msg.sender][1]);
            userPoolBalances[currentIndex-1][msg.sender][0]=0;
            userPoolBalances[currentIndex-1][msg.sender][1]=0;


        } else if (poolInd[token2][token1]!=0){
            pools[poolInd[token2][token1]-1].totalToken1-=userPoolBalances[currentIndex-1][msg.sender][1];
            pools[poolInd[token2][token1]-1].totalToken2-=userPoolBalances[currentIndex-1][msg.sender][0];
            
            contract1.transfer(msg.sender, userPoolBalances[currentIndex-1][msg.sender][1]);
            contract2.transfer(msg.sender, userPoolBalances[currentIndex-1][msg.sender][0]);
            userPoolBalances[currentIndex-1][msg.sender][0]=0;
            userPoolBalances[currentIndex-1][msg.sender][1]=0;
        }
        
    }
}

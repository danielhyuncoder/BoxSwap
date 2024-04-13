// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Token{
    // variables
    uint public decimals = 6;
    string public name = "Ethereum";
    string public symbol="ETH";
    uint256 currentSupply = 0;

    mapping(address=>uint256) public balances;
    mapping(address=>mapping(address=>bool)) hasAccess;
    function balanceOf(address a) public view returns(uint256){
        return balances[a];
    }
    function transfer(address to, uint256 val) public {
        if (balances[msg.sender]>=val){
            balances[to]+=val;
            balances[msg.sender]-=val;
        }
    }
    function transferThroughCustodian(address a, uint256 val) public {
        if (hasAccess[a][msg.sender]){
            if (balances[a]>=val){
                balances[a]-=val;
                balances[msg.sender]+=val;
            }
        }
    }
    function addAccess(address a) public {
        hasAccess[msg.sender][a]=true;
    }
    function revokeAccess(address a) public {
        hasAccess[msg.sender][a]=false;
    }
    function addressHasAccess(address a) public view returns(bool){
        return hasAccess[a][msg.sender];
    }
    function addrHasAccess(address a, address b)public view returns (bool){
        return hasAccess[a][b];
    }
    function mint(uint256 value) public {
        balances[msg.sender]+=value;
    }

}

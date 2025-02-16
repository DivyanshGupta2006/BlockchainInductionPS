//SPDX-Licence-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CodeFund is ERC20Capped, ERC20Burnable{
    address payable public owner;
    uint256 public blockReward;
    constructor(uint256 cap, uint256 reward) ERC20("CodeFund", "CDF") ERC20Capped(cap*(10**decimals())){
        owner=payable(msg.sender);
        _mint(msg.sender, 70000000*(10**decimals()));
        blockReward = reward*(10**decimals());
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
    }

    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward*(10**decimals());
    }

    //Creating access modifier
    modifier onlyOwner{
        require(msg.sender == owner, "Only the Owner can Call This Function");
        _;
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    // Overriding as it's required
    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Capped) {
        if(from != address(0) && to != block.coinbase && block.coinbase != address(0)){
            _mintMinerReward();
        }
        super._update(from, to, amount);
    }

}
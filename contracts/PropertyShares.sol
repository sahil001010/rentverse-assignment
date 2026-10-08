// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// Fractional property shares. The API encodes `invest` and the
/// connected wallet signs and broadcasts the transaction.
contract PropertyShares {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    uint256 public sharePriceWei;
    address public owner;

    mapping(address => uint256) public balanceOf;

    event Invested(address indexed investor, uint256 shares, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    constructor(string memory propertyName, string memory propertySymbol, uint256 priceWei) {
        name = propertyName;
        symbol = propertySymbol;
        sharePriceWei = priceWei;
        owner = msg.sender;
    }

    function invest(uint256 shares) external payable {
        require(shares > 0, "Zero shares");
        uint256 cost = shares * sharePriceWei;
        require(msg.value == cost, "Incorrect ETH");

        balanceOf[msg.sender] += shares;
        totalSupply += shares;

        emit Invested(msg.sender, shares, msg.value);
        emit Transfer(address(0), msg.sender, shares);
    }

    function getShareBalance(address account) external view returns (uint256) {
        return balanceOf[account];
    }
}

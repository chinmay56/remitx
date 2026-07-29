// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Remittance {
    event MoneyTransferred(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    function sendMoney(address payable receiver) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(receiver != address(0), "Invalid receiver address");
        
        receiver.transfer(msg.value);
        
        emit MoneyTransferred(msg.sender, receiver, msg.value, block.timestamp);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}

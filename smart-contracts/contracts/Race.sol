// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Race {
    address public owner;
    uint256 public prizePool;
    address public lastWinner;

    struct Bet {
        uint256 amount;
        bool placed;
    }

    mapping(address => Bet) public bets; // 🏆 사용자의 배팅 금액 저장

    constructor() {
        owner = msg.sender;
    }

    event BetPlaced(address indexed player, uint256 amount);
    event RaceEnded(address indexed winner, uint256 prizeAmount);

    function placeBet() public payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(!bets[msg.sender].placed, "You already placed a bet");

        bets[msg.sender] = Bet(msg.value, true);
        prizePool += msg.value;

        emit BetPlaced(msg.sender, msg.value);
    }

    function endRace(bool won) public {
        require(prizePool > 0, "No prize pool available");
        require(bets[msg.sender].placed, "No bet found");

        if (won) {
            uint256 payout = bets[msg.sender].amount * 2; // 🏆 배팅 금액의 2배 지급
            require(address(this).balance >= payout, "Not enough funds in contract");
            payable(msg.sender).transfer(payout);
            lastWinner = msg.sender;
            emit RaceEnded(msg.sender, payout);
        }

        // 🏆 사용자의 배팅 정보 초기화
        delete bets[msg.sender];
        prizePool -= bets[msg.sender].amount;
    }

    function withdrawFunds() public {
        require(msg.sender == owner, "Only owner can withdraw funds");
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {} // 컨트랙트에 ETH 예치 가능
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract yugasInsurance {

    address payable insurer; 

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Mumbai
     * Aggregator: Matic/USD
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */

    constructor() payable {
        insurer = payable(msg.sender);
        priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
    
    }

    function getLatestPrice() public view returns (int) {
        (
            ,
            /*uint80 roundID*/ int price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = priceFeed.latestRoundData();
        return price;
    }

    event NewClaim(address indexed from, uint256 timestamp, string regNo, uint256 applicationId, string claimId, string _claimDescription);
    struct Claim {address giver; uint256 timestamp; string regNo; uint256 applicationId; string claimId; string _claimDescription;}
    Claim[] claim;
    function getAllClaim() public view returns (Claim[] memory) {
        return claim;
    }

    event NewClaimStatus(uint256 timestamp, string regNo, uint256 applicationId, string statusId, uint256 amount);
    struct ClaimStatus{uint256 timestamp; string regNo; uint256 applicationId; string statusId; uint256 amount;}
    ClaimStatus[] claimstatus;
    function getAllClaimStatus() public view returns (ClaimStatus[] memory) {
        return claimstatus;
    }

    event NewPolicy (
        address indexed from,
        uint256 timestamp,
        string regNo,
        uint256 premium,
        bytes32 riskId,
        uint256 applicationId
    );

    struct Policy {
        address giver;
        uint256 timestamp;
        string regNo;
        uint256 premium;
        bytes32 riskId;
        uint256 applicationId;
    }

    Policy[] policy;

    function getAllPolicy() public view returns (Policy[] memory) {
        return policy;
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function applyForPolicy(
        string memory _brand,
        string memory _model,
        string memory _regNo,
        uint256 _year,
        uint256 _chassis,
        uint256 _price
    )
    public payable {
        require(_price > 0, "ERROR:INVALID_PRICE");
        uint256 _premium = (_price * 6/10) * uint(int(getLatestPrice()))/100000000;
        bytes32 _riskId = keccak256(abi.encodePacked(_brand, _model, _regNo));
        uint256[] memory payoutOptions = new uint256[](1);
        payoutOptions[0] = _price;
        uint256 _applicationId = (_year + _premium + _price + _chassis);
        emit NewPolicy(msg.sender, block.timestamp, _regNo, _premium, _riskId, _applicationId);
        policy.push(Policy(msg.sender, block.timestamp, _regNo, _premium, _riskId, _applicationId));
    }


    function createClaim(
        string memory _regNo,
        string memory _claimDescription,
        uint256 _applicationId
        ) 
    external {
            string memory _claimId = string(abi.encodePacked(_regNo, Strings.toString(_applicationId)));
            emit NewClaim(msg.sender, block.timestamp, _regNo, _applicationId, _claimId, _claimDescription);
            claim.push(Claim(msg.sender, block.timestamp, _regNo, _applicationId, _claimId, _claimDescription));
    }

    function declineClaim(
        string memory _regNo,
        uint256 _applicationId
        ) 
    external {
        string memory _statusId = string(abi.encodePacked("declined", _regNo, Strings.toString(_applicationId)));
        uint256 _amount = 0;
        emit NewClaimStatus(block.timestamp, _regNo, _applicationId, _statusId, _amount);
        claimstatus.push(ClaimStatus(block.timestamp, _regNo, _applicationId, _statusId, _amount));
    }

    function confirmClaim(
        string memory _regNo,
        uint256 _price,
        uint256 _applicationId
        ) 
    public payable {
        string memory _statusId = string(abi.encodePacked("paid", _regNo, Strings.toString(_applicationId)));
        uint256 _amount = (_price * 8/10) * uint(int(getLatestPrice()))/100000000;
        emit NewClaimStatus(block.timestamp, _regNo, _applicationId, _statusId, _amount);
        claimstatus.push(ClaimStatus(block.timestamp, _regNo, _applicationId, _statusId, _amount));
    }
}
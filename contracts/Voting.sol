pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./UseratioBallot.sol";

/// @title Voting.
contract Voting is Ownable {
    using SafeMath for uint256;

    UseratioBallot internal ballots;
    mapping(address => uint8) public voted;
    uint public ballotTermStart;
    uint public ballotTermEnd;
    bool public votingFinished;

    uint public agreeCount;
    uint public disagreeCount;

    event VoteFinished();

    modifier canVote() {
        require(!votingFinished);
        _;
    }

    /**
     * @dev constructor for create Voting.
     * @param _targetStart The start date of target term of ballots.
     * @param _targetEnd The end date of target term of ballots.
     * @param _ratioBallot Address of ballot contract.
     * @return A boolean that indicates if the operation was successful.
     */
    constructor(uint _targetStart, uint _targetEnd, address _ratioBallot) public {
        require(_ratioBallot != 0x00, "_ratioBallot addres is 0x00");
        require(_targetStart < now, "wrong _targetStart");
        require(_targetEnd < now, "wrong _targetEnd");
        require(_targetStart <= _targetEnd, "_targetStart is not before _targetEnd");

        votingFinished = false;
        ballots = UseratioBallot(_ratioBallot);
        ballotTermStart = _targetStart;
        ballotTermEnd = _targetEnd;
        agreeCount = 0;
        disagreeCount = 0;
    }

    /**
     * @dev Function to voting.
     * @param _agree true is agree voting.
     * @return True if the operation was successful.
     */
    function vote(bool _agree) public canVote {
        require(voted[msg.sender] == 0);
        voted[msg.sender] = 1;
        if(_agree) {
            agreeCount = agreeCount.add(_getBallotsNum());
        } else {
            disagreeCount = disagreeCount.add(_getBallotsNum());
        }
    }

    /**
     * @dev Function to query the num of ballots using the set term.
     * @return True if the operation was successful.
     */
    function _getBallotsNum() internal returns(uint) {
        return ballots.ballotsOf(msg.sender, ballotTermStart, ballotTermEnd);
    }

    /**
     * @dev Function to stop voting.
     * @return True if the operation was successful.
     */
    function voteFinish() public onlyOwner canVote returns(bool){
        votingFinished = true;
        emit VoteFinished();
        return true;
    }
}
pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/** refer: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol
**/
contract UseratioBallot is Ownable {
    using SafeMath for uint256;

    uint256 public constant term_unit = 24 * 60 * 60;
    uint256 public totalSupply_;
    mapping(address => uint256) public balances;
    mapping(address => mapping(uint256 => uint256)) public useratio;

    event Mint(address indexed to, uint256 date);
    event MintFinished();

    bool public mintingFinished = false;


    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    modifier canIncrease(address _to) {
        require(useratio[_to][getNormalizedDate(now)] == 0);
        _;
    }

    constructor() public {
        // constructor
    }

    function getNormalizedDate(uint date) public constant returns (uint256) {
        return (date / term_unit) * term_unit;
    }

    /**
     * @dev Function to increase use ratio.
     * @param _to The address that will receive the increased.
     * @return A boolean that indicates if the operation was successful.
     */
    function increaseRatio(address _to) onlyOwner canMint canIncrease(_to) public returns (bool) {
        totalSupply_ = totalSupply_.add(1);
        balances[_to] = balances[_to].add(1);
        uint date = getNormalizedDate(now);
        useratio[_to][date] = useratio[_to][date].add(1);
        emit Mint(_to, 1);
        return true;
    }

    /**
     * @dev Function to return sender has ballots count.
     * @param _owner The address to query the ballots of.
     * @param _from Start date of ballot count term.
     * @param _to End date of ballot count term.
     * @return sender's ballots count.
     */
    function ballotsOf(address _owner, uint _from, uint _to) public view returns (uint) {
        _from = getNormalizedDate(_from);
        // to correct
        _to = getNormalizedDate(_to);
        uint result = 0;
        for (uint i = _from; i <= _to; i = i + term_unit) {
            result += useratio[_owner][i];
        }
        return result;
    }

    /**
     * @dev Function to return sender ballots at a date.
     * @param _owner The address to query the ballots of.
     * @param _date getting date.
     * @return sender's ballot.
     */
    function ballotsOfAt(address _owner, uint _date) public view returns (uint) {
        return useratio[_owner][_date];
    }

    /**
     * @dev Function to stop minting new tokens.
     * @return True if the operation was successful.
     */
    function finishMinting() onlyOwner canMint public returns (bool) {
        mintingFinished = true;
        emit MintFinished();
        return true;
    }
}

pragma solidity ^0.4.21;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";

/** refer: https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol
**/
contract UseratioToken is Ownable {
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
    require(useratio[_to][getNormalizedDate()] == 0);
    _;
  }

  function UseratioToken() public {
    // constructor
  }

  function getNormalizedDate() public constant returns (uint256) {
    return (block.timestamp / term_unit) * term_unit;
  }

  /**
   * @dev Function to increase use ratio.
   * @param _to The address that will receive the increased.
   * @return A boolean that indicates if the operation was successful.
   */
  function increaseRatio(address _to) onlyOwner canMint canIncrease(_to) public returns (bool) {
    totalSupply_ = totalSupply_.add(1);
    balances[_to] = balances[_to].add(1);
    useratio[_to][getNormalizedDate()] = useratio[_to][getNormalizedDate()].add(1);
    emit Mint(_to, 1);
    return true;
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

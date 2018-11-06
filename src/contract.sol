pragma solidity ^0.4.17;
pragma experimental ABIEncoderV2;
/// solidity : https://solidity.readthedocs.io/en/v0.4.25/abi-spec.html?highlight=pragma%20experimental#handling-tuple-types
/// web3.js  : e.g. tupel parameters: https://ethereum.stackexchange.com/posts/58573/revisions

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";

contract CommonMixin {
    using SafeMath for uint; /// 'uint' means 'uint256'
    /// every uint256 gets methods from SafeMath, e.g. it allows `1.div(2)`

    address public owner;
    uint internal duration;
    uint internal startAt;
    uint internal endAt;

    /// https://solidity.readthedocs.io/en/v0.4.25/contracts.html?highlight=modifier
    /// The function body is inserted where the special symbol `_;` in the definition of a modifier appears

    modifier onlyOnTime { require(isOnTime(), "only on time"); _; }
    modifier onlyTimeOut { require(!isOnTime(), "only time out"); _; }
    modifier onlyOwner { require(msg.sender == owner, "only for owner"); _; }
    event LOG(string tag, bool condition);

    constructor() public {
        startAt = now;
        duration = 30 days;
        owner = msg.sender;
    }

    function isOnTime() public constant returns (bool) { return endAt > now; }

    function isOwner(address addr) public constant returns (bool) { return addr == owner; }
}

contract FunderMixin is CommonMixin {

    uint private fundersOfAmount;

    address[] funderIndexs;
    mapping (address => Funder) funders;

    modifier minimizeContribute { require( msg.value >= 0.5 ether, "ether not enough"); _; }
    event NewFundLog(string name, uint amount, uint fundersOfAmount, uint numFunders);

    struct Funder {
        address addr;
        uint amount;
        uint createdAt;
        string name;
    }

    function getAllFunders() external view returns (address[]) {
        return funderIndexs;
    }

    function getFunder(address addr) public view returns (string, uint) {
        return (funders[addr].name, funders[addr].amount);
    }

    function getFunders() public view returns (string[], uint[]) {
        string[] memory names = new string[](funderIndexs.length);
        uint[] memory amounts = new uint[](funderIndexs.length);

        /// memory vs. storage
        /// https://medium.com/coinmonks/ethereum-solidity-memory-vs-storage-which-to-use-in-local-functions-72b593c3703a

        for (uint i = 0; i < funderIndexs.length; i++) {
            Funder storage funder = funders[funderIndexs[i]];
            names[i] = funder.name;
            amounts[i] = funder.amount;
        }

        return (names, amounts);
    }

    function getNumFunders() public view returns (uint) {
        return funderIndexs.length;
    }

    function getFundersOfAmount() public view returns (uint) {
        return fundersOfAmount;
    }

    function fund(string _name) public minimizeContribute onlyOnTime payable {
        if(funders[msg.sender].amount != 0) {
            funders[msg.sender].amount += msg.value;
            funders[msg.sender].name = _name;
        } else {
            funders[msg.sender] = Funder(msg.sender, msg.value, now, _name);
            funderIndexs.push(msg.sender);
        }
        fundersOfAmount += msg.value;
        emit NewFundLog(_name, msg.value, getFundersOfAmount(), getNumFunders());
    }
}

contract PlayerMixin is usingOraclize, CommonMixin {

    uint private constant GAS_LIMIT = 800000;
    uint private playersOfAmount;
    address[] public playerIndexs;
    mapping (address => Player) players;
    mapping (bytes32 => SignData) private validIds;

    modifier onlyOraclize { require(msg.sender == oraclize_cbAddress(), "only oraclize"); _; }
    modifier onlySigned { require( isSigned(msg.sender), "only signed"); _; }
    modifier minimizeBet { require( msg.value >= 0.1 ether, "ether not enough"); _; }
    modifier isNewPlayer { require(!isSigned(msg.sender), "you already signed"); _; }

    // ===>>> event
    event OraclizeCallbackStep(address addr, bytes32 queryId, uint step, bytes proof);
    event NewPlayerLog(address addr, uint amount, uint playersOfAmount, uint numPlayers);

	  // ===>>> struct
    struct Player {
        address addr;
        uint amount;
        string userId;
        uint createdAt;
        uint beginStep;
        uint endStep;
        bool refunded;
        string encryptHeader;
        bool initStep;
    }

    struct SignData {
        address addr;
        bool valid;
    }

    constructor() public {
        oraclize_setCustomGasPrice(20000000000);
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }

    function getPlayersOfAmount() public view returns (uint) { return playersOfAmount; }

    function getNumPlayers() public view returns (uint) { return playerIndexs.length;  }

    function getBeginStep(address addr) public view returns (uint) { return players[addr].beginStep; }

    function getEndStep(address addr) public view returns (uint) { return players[addr].endStep; }

    function getContestStep(address addr) public view returns (uint) {
        return players[addr].endStep - players[addr].beginStep;
    }

    function getInitStep(address addr) public view returns (bool) { return players[addr].initStep; }

    // Step1
    function request(string _encryptHeader, string _userId, address userAddr) public payable {
        string memory _query = "json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).lifetime.total.steps";
        string memory _method = "GET";
        string memory _url = "https://api.fitbit.com/1/user/-/activities.json";

        /// oraclize has a certain default GAS_LIMIT if not set
        /// the default gas limit for Oraclize calls 200000 (see oraclize docs)
        bytes32 queryId = oraclize_query("computation", [ _query, _method, _url, _encryptHeader ], GAS_LIMIT);

        validIds[queryId] = SignData(userAddr, true);
    }

    // Step2
    function __callback(bytes32 _queryId, string _result, bytes _proof) public onlyOraclize {
        if (!validIds[_queryId].valid) revert();
        SignData memory o = validIds[_queryId];
        emit OraclizeCallbackStep(o.addr, _queryId, parseInt(_result), _proof);
        uint steps = parseInt(_result);
        if(players[o.addr].initStep) {
            players[o.addr].endStep = steps;
        } else {
            players[o.addr].beginStep = steps;
            players[o.addr].initStep = true;
        }
    }

    function isSigned(address addr) public view returns (bool) {
        return players[addr].amount > 0;
    }

    function signup(string _encryptHeader, string _userId) public minimizeBet onlyOnTime isNewPlayer payable {
        addPlayer(msg.sender, msg.value, _userId, _encryptHeader);
        request(_encryptHeader, _userId, msg.sender);
    }

    function updateAllUserStep() public onlyOwner payable {
        for(uint i = 0; i < getNumPlayers(); i++) {
            Player memory player = players[playerIndexs[i]];
            request(player.encryptHeader, player.userId, player.addr);
        }
    }

    function addPlayer(address _addr, uint _amount, string _userId, string _encryptHeader) private {
        players[_addr] = Player(_addr, _amount, _userId, now, 0, 0, false, _encryptHeader, false);
        playerIndexs.push(_addr);
        playersOfAmount += _amount;
        emit NewPlayerLog(_addr, _amount, playersOfAmount, getNumPlayers());
    }
}

contract FitnessContest is PlayerMixin, FunderMixin {

    uint private doneAt;
    uint internal goalStep;
    address[] private winnerIndexs;
    State private state;
    enum State { Started, Ended, Withdrawal}

    modifier availableRefund () {  require(isAvailableRefund(), "you didn't signup."); _; }
    modifier availableAward {
        require(state == State.Ended, "the contest is not end yet.");
        require(msg.sender == owner);
        require(now > doneAt + 10 minutes);
        _;
    }

    event NoticeContestDone(address addr);
    event NoticeAward(address addr);

    constructor(uint _duration, uint _goalStep) public {
        state = State.Started;
        goalStep = _goalStep;
        if(_duration == 0) {
            duration = 30 days;
        } else {
            duration = _duration;
        }
        endAt = now + duration;
    }

    function getState() public view returns (uint) {
        return uint(state);
    }

    function getTotalAmount() public view returns (uint) {
        return getFundersOfAmount() + getPlayersOfAmount();
    }

    function isWinner(address addr) private view returns (bool win) {
        Player memory player = players[addr];
        bool isAchieveStep = (player.endStep - player.beginStep) >= goalStep;
        return !player.refunded && isAchieveStep;
    }

    function calculatorWinners() private {
        for(uint i = 0; i < getNumPlayers(); i++) {
            if (isWinner(playerIndexs[i])) {
                winnerIndexs.push(playerIndexs[i]);
            }
        }
    }

    function getWinnerWithdrawalAmount() public view returns (uint) {
        return this.balance.div(winnerIndexs.length);
    }

    function playersWithdrawal() private {
        if(winnerIndexs.length == 0) return;
        uint averageAmount = getWinnerWithdrawalAmount();
        for(uint i = 0; i < winnerIndexs.length; i++) {
            winnerIndexs[i].transfer(averageAmount);
        }
    }

    // owner Step1
    function contestDone() public onlyOwner onlyTimeOut payable {
        updateAllUserStep();
        state = State.Ended;
        doneAt = now;
        emit NoticeContestDone(msg.sender);
    }

    // owner Step2
    function award() public availableAward payable {
        calculatorWinners();
        playersWithdrawal();
        state = State.Withdrawal;
        emit NoticeAward(msg.sender);
    }

    function playerRefund() public availableRefund {
        msg.sender.transfer(players[msg.sender].amount);
        players[msg.sender].refunded = true;
    }

    function isAvailableRefund() public view returns (bool) {
        bool condition1 = !players[msg.sender].refunded;
        // emit LOG("condition1", condition1);
        bool condition2 = state != State.Withdrawal;
        // emit LOG("condition2", condition1);
        bool condition3 = now > endAt + 3 days;
        // emit LOG("condition3", condition1);
        return isSigned(msg.sender) && condition1 && condition2 && condition3;
    }

    function getContestPayload1(address addr) public view returns (uint, uint, uint, uint, uint, bool) {
        return (getNumPlayers(), getPlayersOfAmount(), getNumFunders(), getFundersOfAmount(), getState(), isSigned(addr));
    }

    function getContestPayload2() public view returns (uint, uint, uint, uint, uint) {
        return (goalStep, duration, startAt, endAt, now);
    }

    function getContestPayload3(address addr) public view returns (uint, uint, bool, bool) {
        return (getBeginStep(addr), getEndStep(addr), isAvailableRefund(), getInitStep(addr));
    }

    function getBalance() public onlyOwner view returns (uint) {
        return this.balance;
    }
}

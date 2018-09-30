pragma solidity ^0.4.17;
pragma experimental ABIEncoderV2;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract CommonMixin {
    
    address public owner;
    uint duration = 30;
    uint internal startAt;
    uint internal endAt;
    
    modifier onlyOnTime { require(isOnTime(), "only on time"); _; }
    modifier onlyTimeOut { require(!isOnTime(), "only time out"); _; }
    modifier onlyOwner { require(msg.sender == owner, "only for owner"); _; }
    
    constructor() public {
        startAt = now;
        endAt = now + (60 * 60 * 24 * duration);
        owner = msg.sender;
    }
    
    function isOnTime() public constant returns (bool) { return endAt > now; }
    
    function isOwner(address addr) public constant returns (bool) { return addr == owner; }
}

contract FunderMixin is CommonMixin {
    
    uint private numFunders;
    uint private fundersOfAmount;
    
    address[] funderAddresses;
    mapping (address => Funder) funders;

    modifier minimizeContribute { require( msg.value >= 0.5 ether, "ether not enough"); _; }
    
    struct Funder {
        address addr;
        uint amount;
        uint createdAt;
        string name;
    }
    
    function getAllFunders() external view returns (address[]) {
        return funderAddresses;
    }
    
    function getFunder(address addr) public view returns (string, uint) {
        return (funders[addr].name, funders[addr].amount);
    }
    
    function getFunders() public view returns (string[], uint[]) {
        string[] memory names = new string[](funderAddresses.length);
        uint[] memory amounts = new uint[](funderAddresses.length);
        
        for (uint i = 0; i < funderAddresses.length; i++) {
            Funder storage funder = funders[funderAddresses[i]];
            names[i] = funder.name;
            amounts[i] = funder.amount;
        }
        
        return (names, amounts);
    }

    
    // 贊助人數
    function getNumFunders() public view returns (uint) {
        return numFunders;
    }
    
    // 贊助總金額
    function getFundersOfAmount() public view returns (uint) {
        return fundersOfAmount;
    }
    
     // 贊助
    function fund(string _name) public minimizeContribute onlyOnTime payable {
        if(funders[msg.sender].amount != 0) {
            funders[msg.sender].amount += msg.value;
            funders[msg.sender].name = _name;
        } else {
            funders[msg.sender] = Funder(msg.sender, msg.value, now, _name);
            numFunders++;
            funderAddresses.push(msg.sender);
        }
        fundersOfAmount += msg.value;
    }
    
}

contract PlayerMixin is usingOraclize, CommonMixin {
    
    uint private constant GAS_LIMIT = 800000;
    uint private minimizeSinupAmount = 0.1 ether;
    uint private numPlayers;
    uint private playersOfAmount;
    
    mapping (uint => address) playerIndexs;
    mapping (address => Player) players;
    mapping (bytes32 => SignData) private signDatas;
    
    modifier onlyOraclize { require(msg.sender == oraclize_cbAddress(), "only oraclize"); _; }
    modifier onlySigned { require( isSigned(msg.sender), "only signed"); _; }
    modifier minimizeSignup { require( msg.value >= minimizeSinupAmount, "ether not enough"); _; }
    modifier isNewPlayer { require(!isSigned(msg.sender), "you already signed"); _; }
    
    // ===>>> event
	event LOG_OraclizeCallbackStep(
		string userId,
		bytes32 queryId,
		uint step,
		bytes proof
	);
	
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
    }
	
	struct SignData {
        string userId;
        address addr;
        uint amount;
        string encryptHeader;
    }
    
    constructor() public {
        // OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        oraclize_setCustomGasPrice(4000000000);
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }
    
    function getPlayersOfAmount() public view returns (uint) { return playersOfAmount; }
    
    function getNumPlayers() public view returns (uint) { return numPlayers;  }
    
    function getBeginStep(address addr) public view returns (uint) { return players[addr].beginStep; }
    
    function getEndStep(address addr) public view returns (uint) { return players[addr].endStep; }
    
    function getContestStep(address addr) public view returns (uint) {
        return players[addr].endStep - players[addr].beginStep;
    }
    
    // Step1
    function requestActivities(string _encryptHeader, string _userId) public payable {
        request("json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).lifetime.total.steps",
                "GET",
                "https://api.fitbit.com/1/user/-/activities.json",
                _encryptHeader,
                _userId);
    }
    
    // Step2
    function request(string _query, string _method, string _url, string _encryptHeader, string _userId) public payable {
        bytes32 queryId = oraclize_query("computation", [ _query, _method, _url, _encryptHeader ], GAS_LIMIT);
        signDatas[queryId] = SignData(_userId, msg.sender, msg.value, _encryptHeader);
    }
    
    // Step3
    function __callback(bytes32 _queryId, string _result, bytes _proof) public onlyOraclize {
        SignData memory o = signDatas[_queryId];
        emit LOG_OraclizeCallbackStep(o.userId, _queryId, parseInt(_result), _proof);
        callback_ForGetUserStep(o.userId, _queryId, parseInt(_result), _proof);
    }
    
    // Step4
    function callback_ForGetUserStep(string _userId, bytes32 _queryId, uint steps, bytes _proof) private {
        SignData memory o = signDatas[_queryId];
        if(isSigned(o.addr)) {
            players[o.addr].endStep = steps;
        } else {
            addPlayer(o.addr, o.amount, o.userId, o.encryptHeader, steps);
        }
    }

    // 是否註冊過
    function isSigned(address addr) public view returns (bool) {
        return players[addr].amount > 0;
    }

    // 註冊
    function signup(string _encryptHeader, string _userId) public minimizeSignup onlyOnTime isNewPlayer payable {
        requestActivities(_encryptHeader, _userId);
    }

    function updateAllUserStep() public onlyOwner payable {
        for(uint i = 0; i < getNumPlayers(); i++) {
            Player memory player = players[playerIndexs[i]];
            requestActivities(player.encryptHeader, player.userId);
        }
    }
    
    function addPlayer(address _addr, uint _amount, string _userId, string _encryptHeader, uint _beginStep) private {
        players[_addr] = Player(_addr, _amount, _userId, now, _beginStep, 0, false, _encryptHeader);
        playerIndexs[numPlayers] = _addr;
        playersOfAmount += _amount;
        numPlayers++;
    }
}

contract FitnessContest is PlayerMixin, FunderMixin {
    
    uint private constant GOAL_STEP = 10000 * duration;
    address[] private winners;
    Status private status;
    enum Status { Started, Ended, Withdrawal}
    
    modifier availableWithdrawal {
        require(isEnded(), "the contest is not end yet.");
        require(isSigned(msg.sender) || (msg.sender == owner));
        // 最好在檢查，超過一個小時，確保每個 user 的 step 都有更新了。
         _;
    }
    
    modifier availableRefund () {  
        require(isSigned(msg.sender), "you didn't signup.");
        require(now > endAt + (day * 3), "you can't apply refund this moment.");
        require(status != Status.Withdrawal, "the status can't apply refund.");
        require(!players[msg.sender].refunded, "you was refund.");
        _;
    }
    
    constructor() public {
        status = Status.Started;
    }
    
    function isEnded() public view returns (bool) {
        return status == Status.Ended;
    }

    function getTotalAmount() public view returns (uint) {
        return getFundersOfAmount() + getPlayersOfAmount();
    }
    
    function isWinner(address addr) private view returns (bool win) {
        Player memory player = players[addr];
        bool isAchieveStep = (player.endStep - player.beginStep) >= GOAL_STEP;
        return !player.refunded && isAchieveStep;
    }
    
    function calculatorWinners() private {
        for(uint i = 0; i < getNumPlayers(); i++) {
            if (isWinner(playerIndexs[i])) {
                winners.push(playerIndexs[i]);
            }
        }
    }
    
    function getWinnerWithdrawalAmount() public view returns (uint) {
        return this.balance / winners.length;
    }
    
    function playersWithdrawal() private {
        uint averageAmount = getWinnerWithdrawalAmount();
        for(uint i = 0; i < winners.length; i++) {
            winners[i].transfer(averageAmount);
        }
    }
    
    function contestDone() public onlyOwner onlyTimeOut payable {
        updateAllUserStep();
        status = Status.Ended;
    }
    
    function withdrawal() public availableWithdrawal {
        status = Status.Withdrawal;
        calculatorWinners();
        playersWithdrawal();
    }
    
    function playerRefund() public availableRefund {
        msg.sender.transfer(players[msg.sender].amount);
        players[msg.sender].refunded = true;
    }

    // 查看合約裡面的結餘
    function getBalance() public onlyOwner view returns (uint amount) {
        return this.balance;
    }
}
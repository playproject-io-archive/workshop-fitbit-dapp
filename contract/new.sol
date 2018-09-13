pragma solidity ^0.4.0;

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "github.com/Arachnid/solidity-stringutils/strings.sol";

contract CommonMixin {
    address public owner;
    
    modifier onlyOwner { require(msg.sender == owner, "only for owner"); _; }
    
    constructor() public {
        owner = msg.sender;
    }
}

contract FunderMixin is CommonMixin {
    
    uint private numFunders;
    uint private fundersOfAmount;
    
    mapping (address => Funder) funders;

    modifier minimizeContribute { require( msg.value >= 0.1 ether, "ether not enough"); _; }
    
    struct Funder {
        address addr;
        uint amount;
        uint createdAt;
        string name;
        // string url;
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
    function fund(string _name) public minimizeContribute payable {
        if(funders[msg.sender].amount != 0) {
            funders[msg.sender].amount += msg.value;
            funders[msg.sender].name = _name;
        } else {
            funders[msg.sender] = Funder(msg.sender, msg.value, now, _name);
            numFunders++;
        }
        fundersOfAmount += msg.value;
    }
    
}

contract PlayerMixin is usingOraclize, CommonMixin {
    
    using strings for *;
    uint private constant GAS_LIMIT = 400000;
    // uint private constant GAS_LIMIT = 2000000;
    uint private minimizeSinupAmount = 0.1 ether;
    uint private numPlayers;
    uint private playersOfAmount;
    
    mapping (uint => address) playerIndexs;
    mapping (address => Player) players;
    mapping (bytes32 => SignData) public signDatas;
    
    modifier onlyOraclize { require(msg.sender == oraclize_cbAddress(), "only oraclize"); _; }
    modifier minimizeSignup { require( msg.value >= minimizeSinupAmount, "ether not enough"); _; }
    // ===>>> event
    
    event NewOraclizeQuery(string tag, string description);
    event LOG_Address(string tag, address addr);

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
        // 領過了嗎
        bool withdrew;
    }
	
	struct SignData {
        string userId;
        address addr;
        uint amount;
    }
    
    constructor() public {
        // OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        oraclize_setCustomGasPrice(4000000000);
        // oraclize_setCustomGasPrice(20000000000);
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }
    
    function getPlayersOfAmount() public view returns (uint) {
        return playersOfAmount;
    }
    
    function getNumPlayers() public view returns (uint) {
        return numPlayers;
    }
    
    // Step1
    function requestActivities(string _access_token, string _userId) public payable {
        string memory header = strConcat(
			"{'headers': {'content-type': 'json', 'Authorization': 'Bearer ",
			_access_token,
			"'}}"
			);
		emit NewOraclizeQuery("requestActivities", _userId);
        
        request("json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).lifetime.total.steps",
                "GET",
                "https://api.fitbit.com/1/user/-/activities.json",
                header,
                _userId);
    }
    
    // Step2
    function request(string _query, string _method, string _url, string _kwargs, string _userId) public payable {
        bytes32 queryId = oraclize_query("computation",
            [_query,
            _method,
            _url,
            _kwargs]
        , GAS_LIMIT);
        signDatas[queryId] = SignData(_userId, msg.sender, msg.value);
        emit NewOraclizeQuery("request", _userId);
    }
    
    // Step3
    function __callback(bytes32 _queryId, string _result, bytes _proof) onlyOraclize {
        emit NewOraclizeQuery("__callback:", _result);
        // emit LOG_Address("msg.sender:", msg.sender);
        // emit LOG_Address("oraclize_cbAddress():", oraclize_cbAddress());
        SignData memory o = signDatas[_queryId];
        emit LOG_OraclizeCallbackStep(o.userId, _queryId, parseInt(_result), _proof);
        callback_ForGetUserStep(o.userId, _queryId, parseInt(_result), _proof);
    }
    
    // Step4
    function callback_ForGetUserStep(string _userId, bytes32 _queryId, uint steps, bytes _proof) {
        SignData memory o = signDatas[_queryId];
        if(isSigned(o.addr)) {
            players[o.addr].endStep = steps;
        } else {
            addPlayer(o.addr, o.amount, o.userId, steps);
        }
    }

    // 是否註冊過
    function isSigned(address addr) public view returns (bool) {
        return players[addr].amount > 0;
    }
    
    function addPlayer(address _addr, uint _amount, string _userId, uint _beginStep) private {
        players[_addr] = Player(_addr, _amount, _userId, now, _beginStep, 0, false);
        playerIndexs[numPlayers] = _addr;
        playersOfAmount += _amount;
        numPlayers++;
    }
    
    // 註冊
    function signup(string _access_token, string _userId)  public minimizeSignup payable {
        require(!isSigned(msg.sender), "you already signed");
        requestActivities(_access_token, _userId);
    }
    
    // 玩家申請領獎
    function playerWithdrawal(string _access_token, string _userId, uint _endStep) public payable {
        require(isSigned(msg.sender), "you didn't sign yet.");
        // TODO: check deadline
        requestActivities(_access_token, _userId);
        
        // TODO: fake:
        // players[msg.sender].endStep = _endStep;
    }
    
}

contract FitnessContest is PlayerMixin, FunderMixin {
    
    uint private supportMaintainer = 0.1 ether;

    uint private constant GOAL_STEP = 100000;
    bool ended;
    uint startAt;
    uint endAt;
    
    address[] private winners;
    
    constructor() public {
        startAt = now;
        endAt = now + (60 * 60 * 24 * 7);
    }
    
    function getEnded() public returns (bool) {
        return ended;
    }

    function calculatorWinners() private {
        for(uint i = 0; i < getNumPlayers(); i++) {
            if (isWinner(playerIndexs[i])) {
                winners.push(playerIndexs[i]);
            }
        }
    }
    
    function getTotalAmount() public view returns (uint){
        return getFundersOfAmount() + getPlayersOfAmount();
    }
    
    function playersWithdrawal() private {
        uint totalAmount = getTotalAmount();
        uint averageAmount = totalAmount / winners.length;
        for(uint i = 0; i < winners.length; i++) {
            winners[i].transfer(averageAmount);
        }
    }
    
    // 公布活動結果
    function done() public onlyOwner returns (bool reached) {
        require(!ended);
        calculatorWinners();
        playersWithdrawal();
        ended = true;
        // owner.transfer(supportMaintainer);
        return true;
    }
    
    function isWinner(address addr) private returns (bool win){
        Player memory player = players[addr];
        return (player.endStep - player.beginStep) > GOAL_STEP;
    }
    
    function ownerWithdrawal() public onlyOwner returns (uint) {
        // TODO: check deadline
        owner.transfer(this.balance);
        return this.balance;
    }
    
    function kill() public onlyOwner {
        selfdestruct(owner);
    }

    // 合約裡面的結餘
    function getBalance() public onlyOwner view returns (uint amount) {
        return this.balance;
    }
}

contract TestFitnessRace is FitnessContest {
    
    function step1() payable {
        fund("IBM");
    }
    
    function step2() payable {
        fund("ASUS");
    }
    
    function step3() payable {
        signup("token1", "Nina");
        playerWithdrawal("token1", "Nina", 2000000);
    }
    
    function step4() payable {
        signup("token2", "Alex");
        playerWithdrawal("token2", "Alex", 3000000);
    }
    
    function step5() payable {
        signup("token3", "Alin");
        playerWithdrawal("token3", "Alin", 9000);
    }
    
    function step6() payable {
        done();   
    }
    
}
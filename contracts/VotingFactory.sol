pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract VotingFactory{

    address public factoryManager;

    //所有合约地址
    address[] public allVotdings;

    //自己创建的合约集合
    mapping(address => address[]) private creatorVotings;

    //自己参与的合约集合
    //mapping(address => address[]) supportVotings;
    SupportToVotingContract supportToVotingContract;



    constructor() public{
        factoryManager = msg.sender;
        //在构造函数中创建一个全局的SupportToVotingContract合约
        supportToVotingContract = new SupportToVotingContract();
    }

    function creatorVotding (string _voteTitle,string _creatTime,uint _limitVoter,string _voteExplain,uint _q,uint _g,string[] _voteOptions,uint _luckyReward) payable public{
        //(5 * _limitVoter * 10**6),每个投票者获得5*10**6
        //_luckyReward,幸运抽奖
        //10000000,系统费用
        require(msg.value == (5 * _limitVoter * 10**6) + _luckyReward + 10000000);
        address voting = (new Voting).value(msg.value-10000000)(_voteTitle,_creatTime,_limitVoter,_voteExplain,_q,_g,_voteOptions,_luckyReward,msg.sender,supportToVotingContract);
        allVotdings.push(voting);
        creatorVotings[msg.sender].push(voting);
    }

    function getAllVotings() public view returns(address[]){
        return allVotdings;
    }

    function getAllCreatorVotings() public view returns(address[]){
        return creatorVotings[msg.sender];
    }

    function getAllSupportVotings() public view returns(address[]){
        return supportToVotingContract.getSupportToVoting(msg.sender);
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}


contract SupportToVotingContract{
    mapping(address => address[]) public supportVotings;

    function setSupportToVoting(address _support,address _voting) public{
        supportVotings[_support].push(_voting);
    }

    function getSupportToVoting(address _support) public view returns(address[]){
        return supportVotings[_support];
    }
}

contract Voting{
    address public manager;

    struct VoterStruct {
        uint pk;
        uint[2] rpk;
        uint[2] voteAnswer;
        bool reged;
        bool voted;
    }
    address[] private votersAddress;
    //创建一个查询接口
    mapping(address => VoterStruct) private voters;

    string public voteTitle;
    string public creatTime;
    string public starTime;
    string public endTime;
    uint public limitVoter;
    string public voteExplain;
    string[] public voteOptions;
    uint public luckyReward;

    bool startVote;
    uint[] public result;
    bool public resultBool;
    uint[] private pks;

    uint public q;
    uint public g;
    uint public m;
    bool private statisticsed;
    string[] private macCodes;

    SupportToVotingContract supportToVotingContract;

    constructor(string _voteTitle,string _creatTime,uint _limitVoter,string _voteExplain,uint _q,uint _g,string[] _voteOptions,uint _luckyReward,address _creator,SupportToVotingContract _supportToVotingContract) payable public {
        manager = _creator;
        voteTitle = _voteTitle;
        creatTime = _creatTime;
        limitVoter = _limitVoter;
        voteExplain = _voteExplain;
        voteOptions = _voteOptions;
        q = _q;
        g = _g;
        luckyReward = _luckyReward;
        supportToVotingContract = _supportToVotingContract;
    }

    //返回1为此电脑已经参与过本次投票的注册，2为此账号已经参与过本次投票,3为投票人数已达到上限
    function regVoter(uint _pk,string _macCode) public payable returns (bool,uint) {
        require(msg.value == (5 *  2 * 10**6));
        require(!startVote);
        if(limitVoter <= votersAddress.length){
            return (false,3);
        }
        for(uint i=0;i<macCodes.length;i++){
            if(bytes(macCodes[i]).length == bytes(_macCode).length && keccak256(macCodes[i]) == keccak256(_macCode)){
                return (false,1);
            }
        }
        macCodes.push(_macCode);
        if(voters[msg.sender].reged){
            return (false,2);
        }
        VoterStruct memory voterStruct;
        voterStruct.pk = _pk;
        voterStruct.reged = true;
        voters[msg.sender] = voterStruct;
        votersAddress.push(msg.sender);
        pks.push(_pk);
        supportToVotingContract.setSupportToVoting(msg.sender,this);

        return (true,0);
    }

    function rePk(string _starTime) public{
        require(msg.sender == manager);
        starTime = _starTime;
        for(uint k=0 ;k < votersAddress.length ; k++){
            uint x = 1;
            uint y = 1;
            for(uint j=0 ;j < pks.length ; j++){
                if(k > j){
                    x = x * pks[j];
                }else if(k == j){

                }else{
                    y = y * pks[j];
                }
            }
            voters[votersAddress[k]].rpk[0] = x % q;
            voters[votersAddress[k]].rpk[1] = y % q;
        }
        for(uint _m=0;;_m++){
            if(miFang(2,_m) >= votersAddress.length && miFang(2,_m-1) < votersAddress.length){
                break;
            }
        }
        m = _m;
        startVote = true;
    }

    function votering(uint[2] _voteAnswer) public returns (bool) {
        require(startVote);
        if(voters[msg.sender].voted || !voters[msg.sender].reged){
            return false;
        }
        voters[msg.sender].voted = true;
        voters[msg.sender].voteAnswer = _voteAnswer;
        return true;
    }

    function statistics() public {
        require(!statisticsed);
        require(msg.sender == manager);
        //还有注册了没有投票的
        for(uint index = 0; index < votersAddress.length ; index++){
            if(voters[votersAddress[i]].voteAnswer[0] == 0 && voters[votersAddress[i]].voteAnswer[1] == 0){
                resultBool = false;
                require(resultBool);
            }
        }
        uint x = 1;
        uint y = 1;
        for(uint i=0 ;i < votersAddress.length ; i++){
            x = x * voters[votersAddress[i]].voteAnswer[0];
            y = y * voters[votersAddress[i]].voteAnswer[1];
        }
        uint maxy = (q-1) ** votersAddress.length;
        while(x % y != 0){
            y += q;
            if(y > maxy){
                resultBool = false;
                require(resultBool);
            }
        }
        uint res1 = x/y;
        uint res2;
        bool isFind;
        (res2,isFind) = qiuMi(res1,g);
        if(!isFind){
            resultBool = false;
            require(resultBool);
        }
        for(uint j=voteOptions.length;j>0;j--){
            uint c;
            uint canShu = miFang(2,((j-1)*m));
            c = res2 / canShu;
            result.push(c);
            res2 = res2 % canShu;
        }
        statisticsed = true;
        endTime = uint2str(now);
        share(0);
        resultBool = true;
    }

    function uint2str(uint i) internal returns (string c) {
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0){
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        c = string(bstr);
    }

    function share (uint _a) payable public {
        require(msg.sender == manager);
        if(_a != 0){
            uint answerCount = 0;
            for(uint j = 0; j < votersAddress.length ; j++){
                if(voters[votersAddress[j]].voteAnswer[0] == 0 && voters[votersAddress[j]].voteAnswer[1] == 0){
                    answerCount ++;
                }
            }
            require(answerCount > votersAddress.length);
            for(uint x = 0; x < votersAddress.length ; x++){
                if(voters[votersAddress[x]].voteAnswer[0] == 0 && voters[votersAddress[x]].voteAnswer[1] == 0){
                }else{
                    votersAddress[x].transfer(5 * 10**6);
                }
            }
            manager.transfer(address(this).balance);

        }else{
            for(uint i = 0 ; i < votersAddress.length ; i++ ){
                votersAddress[i].transfer(5 * 10**6);
            }
            //幸运参与者
            bytes memory v1 = abi.encodePacked(block.timestamp,block.difficulty,votersAddress.length);
            bytes32 v2 = keccak256(v1);
            uint256 v3 = uint256(v2);

            uint256 index = v3 % votersAddress.length;
            votersAddress[index].transfer(luckyReward);

            manager.transfer(address(this).balance);
        }
    }

    function qiuMi (uint res,uint di) internal returns (uint,bool) {
        uint i;
        for(i=0;;i++){
            uint res1 = miFang(di,i*10);
            uint res2 = miFang(di,(i+1)*10);
            if(res1 < res && res2 > res){
                break;
            }else if(res1 == res){
                return (i*10,true);
            }else if(res2 == res){
                return ((i+1)*10,true);
            }
        }
        for(uint k=i*10;;k++){
            uint res3 = miFang(di,k);
            if(res3 == res){
                return (k,true);
            }else if(res3 > res){
                return (0,false);
            }
        }
        return (0,false);
    }

    function miFang(uint x,uint y) pure internal returns (uint){
        uint res = 1;
        for(uint i=0;i<y;i++){
            res = res * x;
        }
        return res;
    }

    function yueFen(uint m,uint n) pure internal returns (uint,uint) {
        uint i = n;
        for(i;i>=2;i--){
            if(m % i == 0 && n % i == 0){
                m = m/i;
                n = n/i;
            }
        }
        return (m,n);
    }

    function getVoterAccout() public view returns (uint){
        return votersAddress.length;
    }

    function getRpk() public view returns (uint[2]){
        return voters[msg.sender].rpk;
    }

    function getMyAnswer() public view returns (uint[2],uint){
        return (voters[msg.sender].voteAnswer,voters[msg.sender].pk);
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function getVoteOptions() public view returns(string[]){
        return voteOptions;
    }

    function getRPk() public view returns(uint[2]){
        return voters[msg.sender].rpk;
    }

    function getPk() public view returns(uint){
        return voters[msg.sender].pk;
    }

    function getVoted() public view returns(bool){
        return voters[msg.sender].voted;
    }

    function getResult() public view returns(uint[],bool){
        return (result,resultBool);
    }

}


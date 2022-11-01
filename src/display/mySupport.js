import React, {Component} from 'react';
import MyThs from "../component/myThs";
import ReactDOM from "react-dom";
import Reg from "./reg";
import VoteNow from "./voteNow";
import End from "./end";


let web3 = require('../utils/initWeb3')
let {votingFactoryContractInstance, votingABI} = require('../eth/lotteryInstance')

// string _voteTitle,输入
// uint _creatTime,系统初始化
// uint _limitVoter,输入
// string _voteExplain,输入
// uint _q,uint _g,系统初始化
// string[] _voteOptions,输入（数组）
// uint _luckyReward，输入

class IndexP extends Component {
    constructor(props) {
        super(props)
        this.state = {
            list: []
        }

    }

    //内置钩子函数，在页面渲染之后自动调用
    componentDidMount() {

    }



    //内置钩子函数，在页面渲染之前调用
    async componentWillMount() {
        //获取当前的所有地址
        let _getAllSupportVotings = await votingFactoryContractInstance.methods.getAllSupportVotings().call({
            from: window.ethereum.selectedAddress
        })

        let detailsPromises = _getAllSupportVotings.map(function (voteAddress){

            return new Promise(async(resolve, reject) => {
                //对实例进行填充地址，可以使用了let votingContractInstance = new web3.eth.Contract(VotingABI)
                try {
                    let newVotingContractInstance = new web3.eth.Contract(votingABI);
                    newVotingContractInstance.options.address = voteAddress
                    //调用方法，返回funding合约的详情
                    let title = await newVotingContractInstance.methods.voteTitle().call()
                    let voteExplain = await newVotingContractInstance.methods.voteExplain().call()
                    let manager = await newVotingContractInstance.methods.manager().call()
                    let creatTime = await newVotingContractInstance.methods.creatTime().call()

                    let starTime = await newVotingContractInstance.methods.starTime().call()
                    let endTime = await newVotingContractInstance.methods.endTime().call()
                    let voted = await newVotingContractInstance.methods.getVoted().call({
                        from: window.ethereum.selectedAddress,
                    })
                    let state = '未知错误！'
                    if(starTime === ''){
                        state = '注册阶段'
                    }else if(starTime !== '' && endTime === ''){
                        state = '投票阶段'
                    }else if(endTime !== ''){
                        state = '结束阶段'
                    }
                    let detail = {title,voteExplain,manager,creatTime,state,voted}
                    resolve (detail)
                }catch (e){
                    reject(e)
                }
            })

        })

        this.setState({
            list: await Promise.all(detailsPromises)
        })
    }

    //卸载钩子函数
    // componentDidMount

    // jianTing = () => {
    //     window.ethereum.on("accountsChanged", function(accounts) {
    //         window.location.reload()
    //     });
    // }

    handleClick = (index) => {
        if(this.state.list[index].state === "投票阶段"){
            ReactDOM.render(<VoteNow index={index} />, document.getElementById('root'));
        }else {
            ReactDOM.render(<End index={index} />, document.getElementById('root'));
        }
    }


    render() {
        let numP = 3
        return (
            <div className="row">
                <div className="sixteen wide column">
                    <div className="ui segments">
                        <div className="ui segment">
                            <h5 className="ui header">
                                所有投票列表
                            </h5>
                        </div>
                        <div className="ui segment">
                            <table id="data_table" className="ui compact selectable striped celled table tablet stackable" cellSpacing="0" width="100%">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Brief introduction</th>
                                    <th>Creater address</th>
                                    <th>Creat time</th>
                                    <th>State</th>
                                    <th>Operation</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </tbody>

                                <MyThs
                                    details = {this.state.list}
                                    numP = {numP}
                                    handleClick = {this.handleClick}
                                />
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default IndexP;

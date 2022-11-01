import React, {Component} from 'react';

import {Form} from "semantic-ui-react";

let web3 = require('../utils/initWeb3')
let {votingFactoryContractInstance, votingContractInstance} = require('../eth/lotteryInstance')

// string _voteTitle,输入
// uint _creatTime,系统初始化
// uint _limitVoter,输入
// string _voteExplain,输入
// uint _q,uint _g,系统初始化
// string[] _voteOptions,输入（数组）
// uint _luckyReward，输入

class NewCreat extends Component {
    constructor(props) {
        super(props)
        this.state = {
            voteTitle: '',
            voteExplain: '',
            limitVoter: '',
            luckyReward: '',
            voteOptions: '',

            submittedVoteTitle: '',
            submittedVoteExplain: '',
            submittedLimitVoter: '',
            submittedLuckyReward: '',
            submittedVoteOptions: [],

            submittedCreatTime: '',
            submittedQ: '',
            submittedG: '',

            currentAccount: '',

            isClick: false,
        }

    }

    //内置钩子函数，在页面渲染之后自动调用
    componentDidMount() {

    }



    //内置钩子函数，在页面渲染之前调用
    async componentWillMount() {
        //获取当前的所有地址
        let accounts = await web3.eth.getAccounts()

        this.setState({
            currentAccount: accounts[0],

        })
    }

    //卸载钩子函数
    // componentDidMount

    // jianTing = () => {
    //     window.ethereum.on("accountsChanged", function(accounts) {
    //         window.location.reload()
    //     });
    // }

    //生成g，q
    elgamalInit = () => {
        let input_len = parseInt(String(Math.random() * (0 - 10 ) + 10) );
        while(input_len < 5){
            input_len = parseInt(String(Math.random() * (0 - 10 ) + 10) );
        }
        let q = this.genRandom(input_len);
        while(true){
            q = this.genRandom(input_len);
            if(this.millerRabin(q)){
                break;
            }
        }
        let g;
        for(g=2;g<q-1;g++){
            if(q-1 % g !== 0){
                break;
            }
        }
        this.state.submittedG = g;
        this.state.submittedQ = q;
    }

    genRandom = (len) => {
        let num = Math.pow(2,len)
        let num1 = Math.pow(2,len-1)
        let n = parseInt(String(Math.random() * (0 - num ) + num) );
        while(n < num1 ){
            n = parseInt(String(Math.random() * (0 - num ) + num) );
        }
        return n;
    }
//一个随机的大素数q(20wei)和属于Zq*的生成元g
    millerRabin = (n) => {
        if(n===2 || n===3 || n===5 || n===7 || n===11 || n===13){
            return true;
        }else if (n===1 || n % 2 === 0 || n % 3 === 0 || n % 5 === 0 || n % 7 === 0 || n % 11 === 0 || n % 13 === 0){
            return false;
        }
        let k = 0;
        let u = n - 1;
        while(u !== 1){
            k = k + 1;
            u = u >> 1;
        }
        let m = u;

        let a = parseInt(String(Math.random() * (0 - (n - 1) ) + (n - 1)));
        //int a = random.nextInt(n-1); [0,n-1)
        while(a < 2 || a===n){
            a = parseInt(String(Math.random() * (0 - (n - 1) ) + (n - 1)));
        }
        let r = Math.pow(a, m) % n;
        if(r === 1){
            return  true;
        }else {
            for (let j=0;j<k;j++){
                if(r === n-1){
                    return true;
                }else {
                    r = Math.pow(r, 2) % n;
                }
            }
            return false;
        }
    }

    showtime = () => {
        let nowdate = new Date();
        let year = nowdate.getFullYear(),
            month = nowdate.getMonth() + 1,
            date = nowdate.getDate(),
            day = nowdate.getDay(),
            week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            h1 = nowdate.getHours(),
            m1 = nowdate.getMinutes(),
            s1 = nowdate.getSeconds(),
            h = this.checkTime(h1),
            m = this.checkTime(m1),
            s = this.checkTime(s1);
        return year + "年" + month + "月" + date + "日" + week[day] + " " + h +":" + m + ":" + s;
    }

    checkTime = (i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    //aaa,bbb,ccc
    handleChange = (e, { name, value }) => {
        this.setState({ [name]: value })
    }

    // async componentWillMount() {
    //     //获取当前的所有地址
    //     let accounts = await web3.eth.getAccounts()
    //     let manager = await lotteryInstance.methods.factoryManager().call()
    //
    //     this.setState({
    //         manager,
    //     })
    // }

    handleSubmit = () => {
        this.state.isClick = true
        this.elgamalInit();
        this.state.submittedVoteTitle = String(this.state.voteTitle)
        this.state.submittedVoteExplain = String(this.state.voteExplain)
        this.state.submittedLimitVoter = Number(this.state.limitVoter)
        this.state.submittedLuckyReward = Number(this.state.luckyReward)
        this.state.submittedVoteOptions = this.state.voteOptions.split(',')
        this.state.submittedVoteOptions.push("弃票")
        this.state.submittedCreatTime = String(this.showtime())
        //判空 null
        this.creatNewVote().then(function (){
            console.log('上传完成！');
        })
    }

    //(5 * _limitVoter * 10**6) + _luckyReward + 10000000
    //string _voteTitle,uint _creatTime,uint _limitVoter,string _voteExplain,uint _q,uint _g,string[] _voteOptions,uint _luckyReward
    creatNewVote = async () => {
        try{
            await votingFactoryContractInstance.methods.creatorVotding(
                this.state.submittedVoteTitle,
                this.state.submittedCreatTime,
                this.state.submittedLimitVoter,
                this.state.submittedVoteExplain,
                this.state.submittedQ,
                this.state.submittedG,
                this.state.submittedVoteOptions,
                this.state.submittedLuckyReward).send({
                from: window.ethereum.selectedAddress,
                value: (5 * this.state.submittedLimitVoter * Math.pow(10,6)) + this.state.submittedLuckyReward + Math.pow(10,7),
                gas: '3000000'
            })
            this.setState({isClick : false})
            window.location.reload()
            alert('发布成功!')
        }catch (e){
            this.setState({isClick : false})
            alert('发布失败!')
            console.log(e)
        }
    }
    //              voteTitle: '',
    //             voteExplain: '',
    //             limitVoter: '',
    //             luckyReward: '',
    //             voteOptions: '',
    //
    //             submittedVoteTitle: '',
    //             submittedVoteExplain: '',
    //             submittedLimitVoter: '',
    //             submittedLuckyReward: '',
    //             submittedVoteOptions: [],
    //
    //             submittedCreatTime: '',
    //             submittedQ: '',
    //             submittedG: '',
    //
    //             currentAccount: '',
    //
    //             isClick: false,

    render() {
        const { voteTitle, voteExplain, limitVoter, luckyReward,voteOptions } = this.state
        const isClick = this.state.isClick
        return (
            <div className="row">
                <div className="sixteen wide column">
                    <div className="ui segments">
                        <div className="ui segment">
                            <Form onSubmit={this.handleSubmit}>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>voteTitle</label>
                                <Form.Input
                                    placeholder='voteTitle'
                                    name='voteTitle'
                                    value={voteTitle}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>voteExplain</label>
                                <Form.Input
                                    placeholder='voteExplain'
                                    name='voteExplain'
                                    value={voteExplain}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>limitVoter</label>
                                <Form.Input
                                    placeholder='limitVoter'
                                    name='limitVoter'
                                    value={limitVoter}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>luckyReward</label>
                                <Form.Input
                                    placeholder='luckyReward'
                                    name='luckyReward'
                                    value={luckyReward}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>voteOptions</label>
                                <Form.Input
                                    placeholder='voteOptions:A,B,C,D'
                                    name='voteOptions'
                                    value={voteOptions}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Button content='input' />
                </Form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default NewCreat;

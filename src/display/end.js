import React, {Component} from 'react';
import {Form, Button, Icon, Label, Menu, Table, Header,Container} from "semantic-ui-react";
import ReactDOM from "react-dom";


let web3 = require('../utils/initWeb3')
let {votingFactoryContractInstance, votingABI} = require('../eth/lotteryInstance')

class End extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.index)
        this.state = {
            voteOptions: [],
            voteTitle: '',
            voteExplain: '',
            voteResult: []
        }

    }

    //内置钩子函数，在页面渲染之后自动调用
    async componentWillMount() {
        let voteAllCreatorAddresses = await votingFactoryContractInstance.methods.getAllCreatorVotings().call()
        let nowVoteAddress = voteAllCreatorAddresses[this.props.index]
        let _newVotingContractInstance = new web3.eth.Contract(votingABI,nowVoteAddress);

        //uint[],bool
        let _voteOptions = await _newVotingContractInstance.methods.getVoteOptions().call()
        let _voteTitle = await _newVotingContractInstance.methods.voteTitle().call()
        let _voteExplain = await _newVotingContractInstance.methods.voteExplain().call()
        let boj1 = await _newVotingContractInstance.methods.getResult().call()
        if(Object.values(boj1)[1] === false){
            await _newVotingContractInstance.methods.statistics().send({
                from: window.ethereum.selectedAddress,
                gas: '3000000'
            })
            boj1 = await _newVotingContractInstance.methods.getResult().call()
        }
        if(Object.values(boj1)[1]){
            console.log("结算成功")
            let _result = []
            for(let i = Object.values(boj1)[0].length-1; i >= 0; i--){
                _result.push(Object.values(boj1)[0][i])
            }
            this.setState({
                voteOptions: _voteOptions,
                voteTitle: _voteTitle,
                voteExplain: _voteExplain,
                voteResult: _result
            })
        }else {
            console.log("结算失败")
            let _result1 = [4]
            _result1[0] = 0
            _result1[1] = 1
            _result1[2] = 2
            _result1[3] = 3

            this.setState({
                voteOptions: _voteOptions,
                voteTitle: _voteTitle,
                voteExplain: _voteExplain,
                voteResult: _result1
            })
        }
    }



    //卸载钩子函数
    // componentDidMount

    tableHead = () => {

    }


    //身份id:address
    //按钮，生成公私钥
    //提交
    render() {
        let tableHead = this.state.voteOptions.map((option,index) => {
            return(
                <Table.HeaderCell key={index}>{option}</Table.HeaderCell>
            )
        })
        let tableBody = this.state.voteResult.map((option,index) => {
            return(
                <Table.Cell key={index}>{option}</Table.Cell>
            )
        })
        return (
            <div className="row">
                <div className="sixteen wide column">
                    <div className="ui segments">
                        <div className="ui segment">
                            <Container textAlign='center' text>
                                <Header as='h2'>{this.state.voteTitle}</Header>
                                <p>{this.state.voteExplain}</p>
                                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            {
                                tableHead
                            }
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            {
                                tableBody
                            }
                        </Table.Row>
                    </Table.Body>
                </Table>
                            </Container>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default End;

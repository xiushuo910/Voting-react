import React, {Component} from 'react';
import { Form,Button } from "semantic-ui-react";
import ReactDOM from "react-dom";


let web3 = require('../utils/initWeb3')
let {votingFactoryContractInstance, votingABI} = require('../eth/lotteryInstance')

class Reg extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.index)
        this.state = {
            g: '',
            q: '',
            myAddress: '',
            privateKey: '',
            publicKey: '',

            currentAccount: '',
            newVotingContractInstance: {}

        }

    }

    //内置钩子函数，在页面渲染之后自动调用
    async componentWillMount() {
        let myAddresses = await web3.eth.getAccounts()
        let _myAddress = myAddresses[0]
        let voteAllAddress = await votingFactoryContractInstance.methods.getAllVotings().call()
        let nowVoteAddress = voteAllAddress[this.props.index];
        let _newVotingContractInstance = new web3.eth.Contract(votingABI);
        _newVotingContractInstance.options.address = nowVoteAddress;

        let _g = await _newVotingContractInstance.methods.g().call()
        let _q = await _newVotingContractInstance.methods.q().call()

        console.log(_newVotingContractInstance)

        this.setState({
            g: _g,
            q: _q,
            currentAccount: _myAddress,
            newVotingContractInstance: _newVotingContractInstance
        })

    }



    //卸载钩子函数
    // componentDidMount
    handleChange = (e, { name, value }) => {
        this.setState({ [name]: value })
    }

    //pk,macCode
    handleSubmit = () => {
        this.creatNewVote().then(function (){
            console.log('上传完成！');
        })
    }

    creatNewVote = async () => {
        try{
            //MAC地址没做
            await this.state.newVotingContractInstance.methods.regVoter(
                Number(this.state.publicKey),
                String("fdhdfhd")
                ).send({
                from: window.ethereum.selectedAddress,
                gas: 3000000,
                value: 10000000
            })
            this.setState({isClick : false})
            window.location.reload()
            alert('注册成功!')
        }catch (e){
            this.setState({isClick : false})
            alert('注册失败!')
            console.log(e)
        }
    }

    bigDiv =(a,b) => {
        let alen = a.length, blen = b.length;
        let quotient = 0, remainder = 0;
        let result = [], temp = 0;
        for (let i = 0; i < alen; i++) {
            temp = remainder * 10 + parseInt(a[i]);
            if (temp < b) {
                remainder = temp;
                result.push(0);
            } else {
                quotient = parseInt(temp / b);
                remainder = temp % b;
                result.push(quotient);
            }

        }
        return [result.join("").replace(/\b(0+)/gi, ""), remainder];//结果返回[商，余数]
    }

    dazhenghsuAdd = (str1,str2) => {
        str1 = str1.split('').reverse();
        str2 = str2.split('').reverse();
        let result = [];
        for (let i = 0; i < str1.length; i++) {
            for (let j = 0; j < str2.length; j++) {
                result[i + j] = result[i + j] || 0;//如果result[i+j]是undefined则将其变为0
                result[i + j] += parseInt(str1[i]) * parseInt(str2[j]);
            }
        }
        let temp;
        for (let k = 0; k < result.length; k++) {
            if (result[k] > 9) {
                temp = Math.floor(result[k] / 10);
                result[k] = result[k] % 10;
                result[k + 1] = result[k + 1] || 0;
                result[k + 1] += temp;
            }
        }
        return result.reverse().join('');
    }

    keyClick = () => {
        //    生成公私钥
        let x = 0;
        let _q = this.state.q
        let _g = this.state.g
        while(x === 0){
            x = Math.floor(Math.random()*_q);
        }
        let sk = x;
        let strG = Math.pow(_g,53).toString();
        let strQ = Math.pow(_q,1).toString();
        let y = '1';
        while(x > 0){
            if(x<53){
                strG = Math.pow(_g,x).toString();
                x = 0;
            }else {
                x = x-53;
            }
            y = this.dazhenghsuAdd(y,strG);
        }
        let pk = new Array(2);
        pk = this.bigDiv(y,strQ);

        this.state.privateKey = sk
        this.state.publicKey = pk[1]

        this.handleChange('',{'privateKey':sk})
        this.handleChange('',{'publicKey':pk[1]})

        console.log(this.state.privateKey)
        console.log(this.state.publicKey)
    }


    //身份id:address
    //按钮，生成公私钥
    //提交
    render() {
        return (
            <div>
                <Button positive onClick = {this.keyClick}>Generate</Button>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <label>Private key</label>
                            <Form.Input
                                disabled
                                placeholder='Private key'
                                name='privateKey'
                                value={this.state.privateKey}
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Public key</label>
                            <Form.Input
                                disabled
                                placeholder='Public key'
                                name='publicKey'
                                value={this.state.publicKey}
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <label>Address</label>
                            <Form.Input
                                disabled
                                placeholder='Address'
                                name='address'
                                value={this.state.currentAccount}
                                onChange={this.handleChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Button content='input' />
                </Form>
            </div>
        );
    }
}

export default Reg;

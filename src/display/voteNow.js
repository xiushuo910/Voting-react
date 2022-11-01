import React, {Component} from 'react';
import { Form,Button,Container,Header } from "semantic-ui-react";


let web3 = require('../utils/initWeb3')
let {votingFactoryContractInstance, votingABI} = require('../eth/lotteryInstance')

class VoteNow extends Component {
    constructor(props) {
        super(props)
        console.log(this.props.index)
        this.state = {
            voteOptions: [],
            voteTitle: '',
            voteExplain: '',
            value: '',
            q: '',
            g: '',
            rpk: [2],
            pk: '',
            m: '',
            encryption: '',
            autograph: '',

            answer: [2],
            newVotingContractInstance: {}
        }

    }

    //内置钩子函数，在页面渲染之后自动调用
    async componentWillMount() {
        let voteAllCreatorAddresses = await votingFactoryContractInstance.methods.getAllCreatorVotings().call()
        let nowVoteAddress = voteAllCreatorAddresses[this.props.index]
        let _newVotingContractInstance = new web3.eth.Contract(votingABI);
        _newVotingContractInstance.options.address = nowVoteAddress;

        console.log(_newVotingContractInstance)

        let _voteOptions = await _newVotingContractInstance.methods.getVoteOptions().call()
        let _voteTitle = await _newVotingContractInstance.methods.voteTitle().call()
        let _voteExplain = await _newVotingContractInstance.methods.voteExplain().call()
        let _g = await _newVotingContractInstance.methods.g().call()
        let _q = await _newVotingContractInstance.methods.q().call()
        let _rpk = await _newVotingContractInstance.methods.getRPk().call({
            from: window.ethereum.selectedAddress,
        })
        let _pk = await _newVotingContractInstance.methods.getPk().call({
            from: window.ethereum.selectedAddress,
        })
        let _m = await _newVotingContractInstance.methods.m().call()

        this.setState({
            voteOptions: _voteOptions,
            voteTitle: _voteTitle,
            voteExplain: _voteExplain,
            g: _g,
            q: _q,
            rpk: _rpk,
            pk: _pk,
            m: _m,
            newVotingContractInstance: _newVotingContractInstance
        })
    }

    handleChange = (e, { value }) => this.setState({ value })
    //卸载钩子函数
    // componentDidMount

    //加密
    encryption = () => {
        // let a1 = [2]
        // a1[0] = 22
        // a1[1] = 1
        // this.setState({
        //     q: 97,
        //     g: 2,
        //     pk: 25,
        //     m: 2,
        //     rpk: a1
        // })
        let x = this.state.encryption
        let sk = x;
        let strG = Math.pow(this.state.g,53).toString();
        let strQ = Math.pow(this.state.q,1).toString();
        let y = '1';
        while(x > 0){
            if(x<53){
                strG = Math.pow(this.state.g,x).toString();
                x = 0;
            }else {
                x = x-53;
            }
            y = this.dazhenghsuAdd(y,strG);
            console.log(y);
        }
        let pk = new Array(2);
        pk = this.bigDiv(y,strQ);
        if(Number(pk[1]) !== Number(this.state.pk)){
            alert('请输入正确私钥！');
        }else{
            let vote = this.state.value
            if(vote === undefined){
                alert('请选择！');
            }else {
                let m = this.state.m;
                console.log('vote:'+vote);
                vote = vote * m;
                if(vote != undefined){
                    let vi = Math.pow(2,vote);
                    console.log('vi:'+vi);
                    let rePkeyDown = '1';
                    let yq = '1';
                    let ski = sk;
                    for(ski;ski>0;ski--){
                        yq = this.dazhenghsuAdd(Number(this.state.rpk[0]).toString(),yq);
                        rePkeyDown = this.dazhenghsuAdd(Number(this.state.rpk[1]).toString(),rePkeyDown);
                    }
                    rePkeyDown = this.bigDiv(rePkeyDown,strQ)[1];
                    yq = this.bigDiv(yq,strQ)[1];
                    console.log("rePkeyUp"+yq);
                    console.log("rePkeyDown"+rePkeyDown);
                    let gStr = Math.pow(this.state.g,1).toString();
                    let viWeight = vi * 1;
                    let yh = '1';
                    for(viWeight;viWeight>0;viWeight--){
                        yh = this.dazhenghsuAdd(gStr,yh);
                    }
                    console.log("yh:"+yh);
                    let yy = this.dazhenghsuAdd(Number(yq).toString(),yh);
                    console.log("("+yy+","+rePkeyDown+")")
                    let a1 = [2]
                    a1[0] = yy
                    a1[1] = rePkeyDown
                    this.setState({
                        answer: a1,
                        encryption: "("+yy+","+rePkeyDown+")"
                    })
                }
            }
        }
    }

    autograph = () => {
        let g = this.state.g
        let q = this.state.q
        let _autograph = Math.pow(g,q)
        this.setState({
            autograph: _autograph
        })
    }

    //上传
    handleSubmit = async () => {
        try {
            let bool1 = await this.state.newVotingContractInstance.methods.votering(this.state.answer).send({
                from: window.ethereum.selectedAddress,
                gas: '3000000'
            })
            if(bool1){
                console.log("投票成功")
            }else {
                console.log("投票失败")
            }
        }catch (e){
            console.log(e)
        }
    }

    bigDiv = (a,b) => {
        var alen = a.length, blen = b.length;
        var quotient = 0, remainder = 0;
        var result = [], temp = 0;
        for (var i = 0; i < alen; i++) {
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

    textareaChange = (e, { name, value }) => {
        this.setState({ [name]: value })
    }

    render() {
        let lists = this.state.voteOptions.map((option,_index) => {
            if(_index % 2 === 0 && this.state.voteOptions.length-1 !== _index){
                return(
                    <Form.Group key={_index} widths='equal'>
                        <Form.Radio
                            label= {this.state.voteOptions[_index]}
                            value= {_index}
                            checked={this.state.value === _index}
                            onChange={this.handleChange}
                        />
                        <Form.Radio
                            label= {this.state.voteOptions[_index+1]}
                            value={_index+1}
                            checked={this.state.value === _index+1}
                            onChange={this.handleChange}
                        />
                    </Form.Group>
                )
            }else if(_index % 2 === 0 && this.state.voteOptions.length-1 === _index){
                return(
                    <Form.Group key={_index} widths='equal'>
                        <Form.Radio
                            label= {this.state.voteOptions[_index]}
                            value= {_index}
                            checked={this.state.value === _index}
                            onChange={this.handleChange}
                        />
                    </Form.Group>
                )
            }
        })
        return (
            <div className="row">
                <div className="sixteen wide column">
                    <div className="ui segments">
                        <div className="ui segment">
                            <Container textAlign='left' text>
                    <Header as='h2'>{this.state.voteTitle}</Header>
                    <p>{this.state.voteExplain}</p>

                    <Form>
                        {
                            lists
                        }
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>encryption</label>
                                <Form.Input
                                    placeholder='encryption'
                                    name='encryption'
                                    value={this.state.encryption}
                                    onChange={this.textareaChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Form.Field>
                                <label>autograph</label>
                                <Form.Input
                                    placeholder='autograph'
                                    name='autograph'
                                    value={this.state.autograph}
                                    onChange={this.textareaChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths='equal'>
                            <Button basic color='red' onClick = {this.encryption}>encryption</Button>
                            <Button color='green' basic onClick = {this.autograph}>autograph</Button>
                            <Button color='blue' basic onClick = {this.handleSubmit}>Submit</Button>
                        </Form.Group>
                    </Form>
                </Container>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default VoteNow;

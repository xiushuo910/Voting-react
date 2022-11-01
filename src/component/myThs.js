import React from "react";

const MyThs = (props) => {

    let trs = props.details.map((detail,index) => {
        let btnTxt = ''
        let disabled = false
        if(props.numP === 1){
            if(detail.state === "注册阶段"){
                btnTxt = "参与"
            }else {
                btnTxt = "已结束"
                disabled = true
            }
        }else if(props.numP === 2){
            if(detail.state === "注册阶段"){
                btnTxt = "结束注册"
            }else if(detail.state === "结束阶段"){
                btnTxt = "查看结果"
            }else {
                btnTxt = "结束投票"
            }
        }else if(props.numP === 3){
            if(detail.state === "投票阶段"){
                if(detail.voted){
                    btnTxt = "等待结果"
                    disabled = true
                }else {
                    btnTxt = "投票"
                }
            }else {
                btnTxt = "查看结果"
            }
        }
        let handleClick = () => {
            props.handleClick(index)
        }
        return (
            <tr key={index}>
                <td>{detail.title}</td>
                <td>{detail.voteExplain}</td>
                <td>{detail.manager}</td>
                <td>{detail.creatTime}</td>
                <td>{detail.state}</td>
                <td>
                    <button className="ui greenli button top attached" disabled={disabled} onClick = { handleClick }>{btnTxt}</button>
                </td>
            </tr>
        )
    })

    return (
        <tbody>
        {
            trs
        }
        </tbody>
    )
}

export default MyThs;
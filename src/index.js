import React from 'react';
import Jquery from 'jquery';
import ReactDOM from 'react-dom';

import IndexP from "./display/indexP";
import MyCreatList from "./display/myCreatList";
import MySupport from "./display/mySupport";
import NewCreat from "./display/newCreat";

ReactDOM.render(<IndexP/>, document.getElementById('root'));

Jquery(".menuBtns").click(function(){
    let num = Jquery(this).data("num")
    if(num === 1){
        ReactDOM.render(<IndexP/>, document.getElementById('root'));
    }else if(num === 2){
        ReactDOM.render(<MyCreatList/>, document.getElementById('root'));
    }else if (num === 3){
        ReactDOM.render(<NewCreat/>, document.getElementById('root'));
    }else if (num === 4){
        ReactDOM.render(<MySupport/>, document.getElementById('root'));
    }
});


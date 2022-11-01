//web3相关
//1. 引入web3
let Web3 = require('web3') //1.0版本

let web3Provider;

if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
        // 请求用户授权
        window.ethereum.enable();
    } catch (error) {
        // 用户不授权时
        console.error("User denied account access")
    }
} else if (window.web3) {   // 老版 MetaMask Legacy dapp browsers...
    web3Provider = window.web3.currentProvider;
} else {
    web3Provider = new Web3.providers.HttpProvider('http://localhost:3000/');
}

window.ethereum.on("accountsChanged", function(accounts) {
    window.location.reload();
});

let web3 = new Web3(web3Provider);//web3js就是你需要的web3实例
module.exports = web3

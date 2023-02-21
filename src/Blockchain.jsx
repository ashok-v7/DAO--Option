import Web3 from 'web3'
import {setGlobalState,getGlobalState} from "./store"
import abi from "./abis.DAO.json"

const {ethereum} = window
window.web3 = new Web3(ethereum)
window.web3=new Web3(window.web3.currentProvider)

// setting up the account
// function to connect to wallet and account management

const connectWallet = async()=>{
try{
    if(!ethereum) return alert("please install metamask in browseer")
    const accounts = await ethereum.request({method:"eth_requestAccounts"})
    setGlobalState('connectAccount',accounts[0].toLowerCase())
}
catch(error){
    reportError(error)
}

}

const isWalletConnected = async()=>{
    try{
        if(!ethereum) return alert("please install metamask");
        const accounts = await ethereum.request({method:"eth_accounts"})
        window.ethereum.om('chainChanged',(chainId)=>{
            window.location.reload()
        })

        window,ethereum.on('accountChanged',async()=>{
            setGlobalState('connectedAccount',accounts[0].toLowerCase())
            await isWalletConnected()
        })

        if(accounts.length){
            setGlobalState('connectedAccount',accounts[0].toLowerCase())
        }
        else{
            alert("please connect wallet")
            console.log("no accounts found")
        }
        
    }catch(error){
        reportError(error)    
        }
}


// TO GET THE ethereum contract 

const getEthereumContract = async() => {

    const connectedAccount = getGlobalState('connectedAccount')
    if(connectedAccount){
        const web3 = window.web3
        const   networkId   = await web3.eth.net.getId()  // will get the network ID 
        const   networkData = await abi.networks[networkId]  
        if (networkData) {ethers.utils.parse
            const contract = new web3.eth.Contract(abi.abi,networkData.address)  // similar to getcontract Factory in ethers 
            return contract
        }else {
            return null
        }
    }else {
        return getGlobalState('contract')
    }
}

const performContribute = async(amount) => {
    try{
        amount= window.web3.utils.toWei(amount.toString(),'ether')  //   In ethers.js --> we have ethers.utils.parse
        const contract = await getEthereumContract()
        const account = getGlobalState('connectedAccount')
        
        await contract.methods.contribute().sender({from:account,value:amount}) ///// execution of contribute function from DAO smartcontract
        window.location.reload()
    }catch(error){
        reportError(error)
        return error
    }
}

// getInfo to check person is  a stake holder or not , get DAO balance, individual balance
const getInfo= async () => {
    try {
        if(!ethereum) return alert("please install metamask")
        const contract = await getEthereumContract()
        const connectedAccount = getGlobalState('connectedAccount')
        const isStakeholder = await contract.methods.isStakeholder().call({from:connectedAccount})
        const balance=await contract.methods.daoBalance().call()
        const myBalance = await contract.methods.getBalance().call({from:connectedAccount})
        setGlobalState('Balance',window.web3.utils.fromWei(balance))
        setGlobalState("myBalance",window.web3.utils.fromWei(myBalance))
        setGlobalState("isStakeHolder",isStakeholder)
    }catch(error){
        reportError(error)
    }
}


// function to raise a proposal from createProposal 

const raiseProposal = async ({title,description,beneficiary,amount}) => {

    try{

        amount = window.web3.utils.toWei(amount.toString(),'ether')
        const contract = await getEthereumContract()
        const account = getGlobalState('connectedAccount')

        await contract.methods
        .createProposal(title,description,beneficiary,amount)
        .send({from:account})
        
        window.relocation.relaod()
    }catch(error){
        reportError(error)

    }
}

// function to get Proposals

const getProposals = async()=>{
    try{
        if(!ethereum) return alert("Please install metamask")
        
        const contract = await getEthereumContract()
        const proposals= await contract.methods.getProposals().call()
        setGlobalState('proposal',structuredProposals(proposals))
    }catch(error){
        reportError(error)
    }
}


const structuredProposals = (proposals) => {
    return proposals.map((proposal) => ({
        id:proposal.id,
        amount:      window.web3.utils.fromWei(proposal.amount),
        title:       proposal.title,
        description: proposal.description,
        paid:        proposal.paid,
        passed:      proposal.passed,
        proposer:    proposal.proposer,
        upvotes:     Number(proposal.upvotes), // AT UI side form i/p will be string to convert to NUmber
        downvotes:   Number(proposal.downvotes),
        beneficiary : proposal.beneficiary,
        executor    : proposal.executer,
        duration    : proposal.duration
    }))
}

// simple helper function to get proposals

const getProposal = async(id) => {
    try{
        const proposals = getGlobalState('proposals')
        return proposals.find((proposal)=>proposal.id==id)

    }catch(error){
        reportError(error)
    }
}

const voteOnProposal = async(proposalId,supported)=>{
    try{
        const contract = await getEthereumContract()
        const account = getGlobalState('connectedAccount')

        await contract.methods.Vote(proposalId,supported)
        .send({from:account})

        window.relocation.reload()
    }catch(erorr){
        reportError(erorr)
    }
}


// function to list voters with a helper function

const listVoters = async(id)=>{

    try{
        const contract = await getEthereumContract()

        const votes = await contract.methods.getVotesOf(id).call()
        return votes
    }catch(error){
        reportError(error)
    }

 } 




 // helper function to pay out to the benedificary
 
 const payoutBeneficiary= async(id) =>{
    try{
        const contract = await getEthereumContract()
        const account = getGlobalState('connectedAccount')
        await contract.methods.payoutBeneficiary(id).send({from:account})
        window.location.reload()
    }catch(error){
        reportError(error)
    }
 }

 const reportError = (error) =>{
    console.log(JSON.stringify(error),'red')
    throw new Error('No ethereum object, something is wrong')
 }

 export{
    isWalletConnected,
    connectWallet,
    performContribute,
    getInfo,
    raiseProposal,
    getProposals,
    getProposal,
    voteOnProposal,
    listVoters,
    payoutBeneficiary
 }

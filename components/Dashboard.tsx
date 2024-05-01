import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import React, { useEffect, useRef, useState } from 'react'
import styles from "../styles/Dashboard.module.css"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'

export default function Dashboard() {
	const [showBtn, useShowBtn] = useState(true)
	const [balance, setBalance] = useState(0.0)
	const { publicKey, sendTransaction } = useWallet()
	const { connection }  = useConnection()
	const [amount, setAmount] = useState('0.1')
	const [receiver, setReceiver] = useState('')
	const [lastTrnSignature, setLastTrnSignature] = useState('')

	async function handleTransaction(){
		if (!amount || !receiver) {
			alert("Enter valid data")
			return
		}
		useShowBtn(false)
		const transaction = new Transaction()
		const toPubkey = new PublicKey(receiver)
		const instruction = SystemProgram.transfer({
			fromPubkey: publicKey,
			toPubkey: toPubkey,
			lamports: LAMPORTS_PER_SOL * parseFloat(amount)
		})
		transaction.add(instruction)
		const signature = await sendTransaction(transaction, connection)
		setLastTrnSignature(signature)
		resetInputFields()
	}

	function resetInputFields(){
		setAmount('0.1')
		setReceiver('')
		useShowBtn(true)
		setTimeout(() => setLastTrnSignature(''), 10000)
	}

	async function setWalletBalance() {
		let sols = 0.0
		if (connection && publicKey) {
			sols = await connection.getBalance(publicKey)/LAMPORTS_PER_SOL
		}
		setBalance(sols)
	}

	useEffect(() => {
		setWalletBalance()
	}, [publicKey])

	return (
		<>
			{
				publicKey ? 
				<div className={styles.dashboardDiv}>
					<h2>Balance: {balance} SOL</h2>
					<label>Amount in SOL</label>
					<input name='amount' type='number' min='0.0001' max='10' value={amount} onChange={e => setAmount(e.target.value)}/>
					<label>Send SOL To</label>
					<input name='receiver' type='text' value={receiver} onChange={e => setReceiver(e.target.value)}/>
					<button className={styles.sendButton} onClick={handleTransaction} disabled={!showBtn}>Send</button>
					{lastTrnSignature && <p>Last Transaction Signature: {lastTrnSignature}</p>}
				</div> :
				<h2>Connect to your wallet</h2>
			}
		</>
		
	)
}

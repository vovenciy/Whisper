import { useContext } from "react"
import { MyTokenContext } from "../context/MyToken"
import { useState } from "react"
import { useEffect } from "react"
import Offer from "./Offer"
import { SocketContext } from "../context/Socket"
import { MyNameContext } from "../context/MyName"
import { RequestsContext } from "../context/Requests"
import '../styles/RequestSection.css'
export default function RequestSection () {
    const {Socket, setSocket} = useContext(SocketContext)
    const {MyToken, setMyToken} = useContext(MyTokenContext)
    const [requestToken, setRequestToken] = useState('')
    const {MyName} = useContext(MyNameContext)
    const {Requests, setRequests} = useContext(RequestsContext)
    
    const handleClick = (rt) => {
        let msg = {
            type: 'offer',
            fromName: MyName,
            fromToken: MyToken,
            to: rt,
        }
        Socket.send(JSON.stringify(msg))
        
    }
    return (
        <div class = "request-section">
            <div class = "user-info-block">
                <h2 class = "user-name">My name: {MyName}</h2>
                <h2 class = "user-token">My FriendshipToken: {MyToken}</h2>
            </div>
            <form class = "invite-form" onSubmit={(e) => e.preventDefault()}>
                <input class = "invite-input" placeholder="enter a FriendshipToken" onChange={(event) => setRequestToken(event.target.value)}/>
                <button type = "submit" class="invite-submit-btn" onClick={(event) => handleClick(requestToken)}>send request</button>
            </form>
            {Requests.map((request) => <Offer key = {Math.random()} name={request.reqName} token={request.reqToken}></Offer>)}
        </div>
    )
}
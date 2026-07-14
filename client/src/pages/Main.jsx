import {React, useState, useRef} from "react";
import { Layout } from 'antd';
import ChatHeader from "../components/MyLayout/ChatHeader";
import ChatContent from "../components/MyLayout/ChatContent";
import ChatSider from "../components/MyLayout/ChatSider";
import { ContactsContext } from "../context/contacts";
import { CurrentContactContext } from "../context/CurrentContact"; 
import { useEffect } from "react";
import { useContext } from "react";
import { SocketContext } from "../context/Socket";
import { MyTokenContext } from "../context/MyToken";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { RequestsContext } from "../context/Requests";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { CurrentChatContext } from "../context/CurrentChat";
import { PulsingListContext } from "../context/PulsingList";
import '../styles/Layout.css'
const { Header, Sider, Content } = Layout

export default function Chat() {
  const [PulsingList, setPulsingList] = useSessionStorage('PulsingList', [])
  const [CurrentChat, setCurrentChat] = useState([])
  const [Contacts, setContacts] = useState([])
  const [CurrentContact, setCurrentContact] = useState({name: '???', FriendshipToken: '0', ChatId: '0'})
  const {Socket, setSocket} = useContext(SocketContext)
  const {MyToken, setMyToken} =  useContext(MyTokenContext)
  const {Requests, setRequests} = useContext(RequestsContext)
  const CurrentContactRef = useRef(CurrentContact)

  useEffect(() => {
    CurrentContactRef.current = CurrentContact
  }, [CurrentContact])

  useEffect(() => {
    document.title = 'Whisper'
    for (let contact of Contacts) {
      sessionStorage.setItem(contact.ChatId, null)
    }
    const ContactToSeeFirst = JSON.parse(sessionStorage.getItem('CurrentContact')) || {name: '???'}
    setCurrentContact(ContactToSeeFirst)
    const ws = new WebSocket("ws://whisper.volkov.dev:8080")
    console.log(ws)
    ws.onopen = () => {
        setSocket(ws)
        let AuthMsg = {
          type: 'auth',
          FT: MyToken
        }
        ws.send(JSON.stringify(AuthMsg))
        if (ContactToSeeFirst.name !== '???') {
              let targetID = ContactToSeeFirst.ChatId
              let msg = {
                type: 'give me chat',
                ChatId: ContactToSeeFirst.ChatId
              }
              ws.send(JSON.stringify(msg))
        }
    }
    ws.onmessage = (msg) => {
        try {
          const received = JSON.parse(msg.data.toString())
          if (received.type==='request for friendship') {
              const newReq = {
                  reqName: received.fromName,
                  reqToken: received.fromToken,
              }
              
              setRequests((prevRequests) => prevRequests.map(req => req.reqToken).includes(newReq.reqToken) ? prevRequests : [...prevRequests, newReq])
              
              
          } else if (received.type==='request accepted') {
              const newFriend = {
                
                name: received.FirstName,
                FriendshipToken: received.FirstToken,
                ChatId: received.ChatId
              }
              
              setContacts((prevContacts) => prevContacts.map(contact => contact.FriendshipToken).includes(newFriend.FriendshipToken) ? prevContacts : [...prevContacts, newFriend])
          } else if (received.type==='here is your chat') {
            let newChat = {
              ChatId: received.ChatId,
              ChatItself: received.ChatItself
            }
            sessionStorage.setItem(newChat.ChatId, JSON.stringify(newChat.ChatItself))
            setCurrentChat(newChat.ChatItself)
          
          } else if (received.type==='here are your contacts') {
            setContacts(received.contacts)
            for (let contact of received.contacts) {
              sessionStorage.setItem(contact.ChatId, null)
            }
          } else if (received.type==='Incoming Message') {
            if (document.hidden) {
              document.title = 'new notification!'
            }
            let FromToken = received.from
            let TargetChatId = received.ChatId
            
            let newMessageObject = {
                token: FromToken,
                text: received.message
            }
            
            let prev = JSON.parse(sessionStorage.getItem(TargetChatId)) || []
            prev.push(newMessageObject)
            sessionStorage.setItem(TargetChatId, JSON.stringify(prev))
            
            if (CurrentContactRef.current.FriendshipToken===FromToken) {
              setCurrentChat((prevCurrentChat) => [...prevCurrentChat, newMessageObject])
            } else {
              if (!PulsingList.includes(FromToken)) {
                setPulsingList((prev) => [...prev, FromToken])
              }
            }
          }

        } catch (error) {
          console.log(error)
        }
    }   
    
    ws.onclose = (event) => {
      console.log(event)
    }
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title = 'Whisper'
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    
    
  } , [])
  
  return (
    <PulsingListContext.Provider value = {{PulsingList, setPulsingList}}>
      <CurrentChatContext.Provider value = {{CurrentChat, setCurrentChat}}>
        <ContactsContext.Provider value={{Contacts, setContacts}}>
            <CurrentContactContext.Provider value = {{CurrentContact, setCurrentContact}}>
              <Layout>
                  
                <ChatSider/>
                <Layout>
                  <ChatHeader/>
                  <ChatContent/>
                </Layout>   
              </Layout>
            </CurrentContactContext.Provider>
        </ContactsContext.Provider>
      </CurrentChatContext.Provider>
    </PulsingListContext.Provider>
    
    
  )
}
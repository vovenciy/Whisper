const express = require('express')
const { mkdir } = require('fs/promises')
const WS = express()
const WSServer = require('express-ws')(WS)
const PORT = 8000
const clients = new Map()
const fs = require('fs/promises')
const FSsync = require('fs')
const path = require('path')
const { kill } = require('process')
const readline = require('readline')

const DB_FRIENDS = path.join(__dirname, 'DBFriends.json')

async function getFriends(token) {
    const FriendsArray = []
    const filename = `user_${token}.jsonl`
    const fullpath = path.resolve('./FriendsLists', filename)
    try {
        const filestream = FSsync.createReadStream(fullpath, 'utf-8')
        const rl = readline.createInterface({
            input: filestream,
            crlfDelay: Infinity
        })
        for await (const line of rl) {
            if (line.trim()) {
                try {
                    const friend = JSON.parse(line)
                    FriendsArray.push(friend)
                } catch (error) {
                    console.log(error)
                    return []
                }
            }
        }
    } catch (error) {
        console.log(error)
        return []
    }
    console.log('прочитал список друзей', token)
    return FriendsArray
}

async function MakeFriends(FirstName, FirstToken, SecondName, SecondToken, ChatId) { 
    const fullpath1 = path.resolve('./FriendsLists', `user_${FirstToken}.jsonl`)
    const jsonline1 = JSON.stringify({name: FirstName, FriendshipToken: FirstToken, ChatId: ChatId}) + '\n'
     
    const fullpath2 = path.resolve('./FriendsLists', `user_${SecondToken}.jsonl`)
    const jsonline2 = JSON.stringify({name: SecondName, FriendshipToken: SecondToken, ChatId: ChatId}) + '\n'
    try {
        await fs.appendFile(fullpath1, jsonline2, 'utf-8')
        await fs.appendFile(fullpath2, jsonline1, 'utf-8')
    } catch (error) {
        console.log(error)
        console.log(FirstToken, SecondToken)
    }
    console.log(FirstToken, SecondToken, "теперь кореша") 
}

async function createChat (folder, Id) {
    const filename = `chat_${Id}.jsonl`
    const fullpath = path.resolve(folder, filename)
    await mkdir(folder, {recursive: true})
    await fs.writeFile(fullpath, '', 'utf-8')
    return 
}

async function WriteMessage(ID, senderToken, message) {
    const messageObject = {
        text: message,
        token: senderToken
    }
    const jsonline = JSON.stringify(messageObject) + '\n'
    const filename = `chat_${ID}.jsonl`
    const fullpath = path.resolve('./Chats', filename)
    await fs.appendFile(fullpath, jsonline, 'utf-8')
    
}
async function GetChat(ID) {
    console.log(ID)
    const MessagesArray = []
    const filename = `chat_${ID}.jsonl`
    const fullpath = path.resolve('./Chats', filename)
    try {
        const filestream = FSsync.createReadStream(fullpath, 'utf-8')
        const rl = readline.createInterface({
            input: filestream,
            crlfDelay: Infinity
        })
        for await (const line of rl) {
            if (line.trim()) {
                try {
                    const message = JSON.parse(line)
                    MessagesArray.push(message)
                } catch (error) {
                    console.log(error)
                    return []
                }
            }
        }
    } catch (error) {
        console.log(error)
        return []
    }
    console.log("считал")
    return MessagesArray
}

WS.ws('/', async (ws, req) => {
    ws.on('message', async (message) => {
        data = JSON.parse(message)
        if (data.type==='auth') {
            const tokenToFind = data.FT
            clients.set(tokenToFind, ws)
            console.log('в словарь добавлен сокет с токеном', tokenToFind)
            console.log('Зарегался', data.FT)
            const ListOfFriends = await getFriends(data.FT)
            let msg = {
                type: 'here are your contacts',
                contacts: ListOfFriends
            }
            ws.send(JSON.stringify(msg))
                  
        } else if (data.type==='offer') {
            targetToken = data.to
            
            try {
                targetSocket = clients.get(targetToken)
                
                let msg = {
                    type: 'request for friendship',
                    fromName: data.fromName,
                    fromToken: data.fromToken
                }
                targetSocket.send(JSON.stringify(msg))
            } catch (error) {
                console.log(error)
            }
        } else if (data.type==='request accepted') {
            try {
                targetToken = data.SecondToken
                FirstName = data.FirstName
                FirstToken = data.FirstToken
                SecondName = data.SecondName
                SecondToken = data.SecondToken
                ChatId = data.ChatId
                await MakeFriends(FirstName, FirstToken, SecondName, SecondToken, ChatId)
                await createChat('./Chats', ChatId)
                targetSocket = clients.get(SecondToken)
                let msg = {
                    type: 'request accepted',
                    FirstName,
                    FirstToken,
                    ChatId
                }
                targetSocket.send(JSON.stringify(msg))
                
            } catch (error) {
                console.log(error)
                
            }
            
        } else if (data.type==='give me chat') {
            const FoundChat = await GetChat(data.ChatId)
            let msg = {
                type: 'here is your chat',
                ChatId: data.ChatId,
                ChatItself: FoundChat
            }
            ws.send(JSON.stringify(msg))
        } else if (data.type==='message') {
            const SenderToken = data.from
            const ChatId = data.ChatId
            const messageToAdd = data.message
            await WriteMessage(ChatId, SenderToken, messageToAdd)
            console.log('something happened')

            const targetToken = data.to
            const targetSocket = clients.get(targetToken)
            let msg = {
                type: 'Incoming Message',
                from: SenderToken,
                message: messageToAdd,
                ChatId
            }
            try {
                targetSocket.send(JSON.stringify(msg))
            } catch (error) {
                console.log(error)
            }
        }
    })
    ws.on('close', (event) => {
        console.log(event)
    })
    
        
})
WS.listen(PORT, () => console.log("websocket server started on port", PORT))


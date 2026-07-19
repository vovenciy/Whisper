import express from 'express'
import http from 'http'
import cors from 'cors'
import fs from 'fs/promises'
import {createReadStream} from 'fs'
import path from 'path'
import { mkdir } from 'fs/promises'
import bcrypt from 'bcrypt'
import { customAlphabet } from 'nanoid'
import WebSocket from 'ws'
import readline from 'readline'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const PORT = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)
const WS = new WebSocket.Server({server})
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

const DB_USERS = path.join(__dirname, 'DBusers.jsonl')
const clients = new Map()
async function getUsers() {
    const userslist = []
    try {
        const filestream = createReadStream(DB_USERS, 'utf-8')
        const rl = readline.createInterface({
            input: filestream,
            crlfDelay: Infinity
        })
        for await(const line of rl) {
            if (line.trim()) {
                try {
                    const user = JSON.parse(line)
                    userslist.push(user)
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
    console.log('прочитал список пользователей')
    return userslist
}

async function AddUser(user) {
    const jsonline = JSON.stringify(user) + '\n'
    await fs.appendFile(DB_USERS, jsonline, 'utf-8') 
}

async function CreateFriendsList(userToken) {
    const filename = `user_${userToken}.jsonl`
    await mkdir('./Friendlists', {recursive: true})
    const fullpath = path.resolve('./Friendslists', filename)
    await fs.writeFile(fullpath, '', 'utf-8')
    return
}

async function getFriends(token) {
    const FriendsArray = []
    const filename = `user_${token}.jsonl`
    const fullpath = path.resolve('./Friendslists', filename)
    try {
        const filestream = createReadStream(fullpath, 'utf-8')
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
    const fullpath1 = path.resolve('./Friendslists', `user_${FirstToken}.jsonl`)
    const jsonline1 = JSON.stringify({name: FirstName, FriendshipToken: FirstToken, ChatId: ChatId}) + '\n'
     
    const fullpath2 = path.resolve('./Friendslists', `user_${SecondToken}.jsonl`)
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
    await mkdir(folder, {recursive: true})
    const fullpath = path.resolve(folder, filename)
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
        const filestream = createReadStream(fullpath, 'utf-8')
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

app.post('/registration', async (req, res) => {
    const receivedData = req.body
    const candidate = receivedData.name
    receivedData.password = await bcrypt.hash(receivedData.password, 7)
    let FT = customAlphabet('abcdefghigklmnopqrstuvwxyz1234567890', 6)()
    receivedData.FriendshipToken = FT
    console.log(receivedData)
    const users = await getUsers()
    for (let user of users) {
        if (candidate===user.name) {
            return res.status(400).json({
                message: 'this name is already taken'
            })
        }
    }
    await AddUser(receivedData)
    console.log(`Пользователь добавлен!`);
    await CreateFriendsList(FT)
    console.log('создал папку со списком друзей для', FT)
    return res.status(200).json({
        message: 'account created'
    })
    
})

app.post('/login', async (req, res) => {
    const received = req.body
    const candidateName = received.name
    const candidatePassword = received.password
    const users = await getUsers()
    for (let user of users) {
        if (candidateName===user.name) {
            const isMatch = await bcrypt.compare(candidatePassword, user.password)
            if (isMatch) {
                return res.status(200).json({message: user.FriendshipToken})
            } else {
                return res.status(403).json({message: 'wrong password entered'})
            }
        }
    }
    return res.status(401).json({message: 'user is not found'})
})

WS.on('connection', async (ws, req) => {
    ws.on('message', async (message) => {
        let data = JSON.parse(message)
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
            let targetToken = data.to
            
            try {
                let targetSocket = clients.get(targetToken)
                
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
                let targetToken = data.SecondToken
                let FirstName = data.FirstName
                let FirstToken = data.FirstToken
                let SecondName = data.SecondName
                let SecondToken = data.SecondToken
                let ChatId = data.ChatId
                await MakeFriends(FirstName, FirstToken, SecondName, SecondToken, ChatId)
                await createChat('./Chats', ChatId)
                let targetSocket = clients.get(SecondToken)
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


server.listen(PORT, '0.0.0.0', () => console.log(`server started on port ${PORT}`))
server.keepAliveTimeout = 0





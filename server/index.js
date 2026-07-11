const express = require('express')
const cors = require('cors')
const fs = require('fs/promises')
const FSsync = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const { customAlphabet } = require('nanoid')
const readline = require('readline')
const PORT = 5001
const app = express()
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

const DB_USERS = path.join(__dirname, 'DBusers.jsonl')

async function getUsers() {
    const userslist = []
    try {
        const filestream = FSsync.createReadStream(DB_USERS, 'utf-8')
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
    const fullpath = path.resolve('./Friendslists', filename)
    await fs.writeFile(fullpath, '', 'utf-8')
    return
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




const server = app.listen(PORT, () => console.log(`server started on port ${PORT}`))
server.keepAliveTimeout = 0



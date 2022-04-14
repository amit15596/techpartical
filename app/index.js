import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import http from 'http'
import https from 'https'
// import fetch from "node-fetch"


// import external module
import prisma from './prisma';
import { get } from 'express/lib/response';


const app = express()


app.use(cors())
app.use(express.json())
app.use(helmet());
app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.status(200).json({ "call": "Hello" })
// })

//* Add user data 
app.post('/user', async (req, res) => {
    try {
        
        const url = 'https://jsonplaceholder.typicode.com/users';

        https.get(url, (res) => {

            let data = '',
                json_data;

            res.on('data', async function (stream) {
                data += stream;
            });
            res.on('end', async function () {
                json_data = JSON.parse(data);

                const userDatails = json_data.map((data, index) => {
                    return {
                        name: data.name,
                        username: data.username,
                        email: data.email,
                        phone: data.phone,
                        website: data.website
                    }
                })

                const result =await prisma.user.createMany({
                    data: userDatails
                })

                res.send(userDatails)
            });

        })

    } catch (error) {
        console.log(error)
    }
})

//* get all user details 

app.get('/user', async (req, res) => {
    try {
        const result = await prisma.user.findMany({
            include: {
                posts: true
            }
        })

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
})

//* get user data details 
app.get('/user/:id', async (req, res) => {
    try {
        const result = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id)
            },
            include: {
                posts: true
            }
        })
        res.status(200).json(result)

    } catch (error) {
        console.log(error)
    }
})

//* update user api 

app.put('/user/:id', async(req,res)=>{
    try{
        const updateUser = await prisma.user.update({
            where: {
              id: Number(req.params.id),
            },
            data: {
              name: req.body.name,
              username:req.body.username
            },
          })
          res.status(200).json(updateUser)

    } catch(error){
        console.group(error)
    }
})

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

export default app

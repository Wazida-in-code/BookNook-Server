import express from 'express'
import 'dotenv/config'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 8000

import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGO_CLIENT);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB()

const db = mongoClient.db("BookNook");
const bookCollection = db.collection("books");


// add-book
app.post('/books', async(req, res) => {
    const data = req.body
    const result = await bookCollection.insertOne(data)
    console.log(result);
    res.send(result)
})



// http://localhost:8000/
app.get('/', (req, res) => {
    res.send({msg: "Server running perfectly!"})
})

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})
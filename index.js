import express from 'express'
import 'dotenv/config'

const app = express()
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


// http://localhost:8000/
app.get('/', (req, res) => {
    res.send({msg: "Server running perfectly!"})
})

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})
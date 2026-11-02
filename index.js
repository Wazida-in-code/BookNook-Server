import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 8000

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
const borrowCollection = db.collection("borrows")


// add-book
app.post('/books', async(req, res) => {
    const data = req.body
    const result = await bookCollection.insertOne(data)
    res.send(result)
})

// edit book
app.patch('/books/:id', async(req, res) => {
  const {id} = req.params
  const updatedData = req.body
  const result = await bookCollection.updateOne(
    {_id: new ObjectId(id)}, 
    {$set: updatedData}
  )
  res.json(result)
})

// delete
app.delete('/books/:id', async(req, res) => {
  const {id} = req.params
  const result = await bookCollection.deleteOne({_id: new ObjectId(id)})
  res.json(result)
})

//all books
app.get('/books', async(req, res) => {
  const result = await bookCollection.find().sort({ _id: -1 }).toArray()
  res.send(result)
})


// only 6 books
app.get('/six-books', async(req, res) => {
  const result = await bookCollection.find().sort({ _id: -1 }).limit(6).toArray()
  res.send(result)
})

// borrow books
app.post('/borrows', async(req, res) => {
    const data = req.body
    const result = await borrowCollection.insertOne(data)
    console.log(result);
    res.send(result)
})



//one book at a time
app.get('/books/:id', async(req, res) => {
  const {id} = req.params
  const result = await bookCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})

// my-books by email
app.get('/my-books/:email', async(req, res) => {
  const {email} = req.params
  const result = await bookCollection.find({userEmail: email}).toArray()
  res.send(result)
})



// http://localhost:8000/
app.get('/', (req, res) => {
    res.send({msg: "Server running perfectly!"})
})

app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})
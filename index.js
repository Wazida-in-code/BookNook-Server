import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from 'jose';

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

const verifyToken = async(req, res, next) => {
  const authHeader = req.headers.authorization
  console.log(authHeader);
if (!authHeader) {
        return res.status(401).send({ msg: "Unauthorized!" })
    }
    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).send({ msg: "Unauthorized!" })
    }

    const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`))

    try {
        const {payload} = await jwtVerify(token, JWKS)
        next()
    } catch (error) {
        return res.status(500).send({ msg: "Server Error!" })
    }
}


// add-book
app.post('/books', verifyToken, async(req, res) => {
    const data = req.body
    const result = await bookCollection.insertOne(data)
    res.send(result)
})

// edit book
app.patch('/books/:id', verifyToken, async(req, res) => {
  const {id} = req.params
  const updatedData = req.body
  const result = await bookCollection.updateOne(
    {_id: new ObjectId(id)}, 
    {$set: updatedData}
  )
  res.json(result)
})

// delete
app.delete('/books/:id', verifyToken, async(req, res) => {
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
    const alreadyBorrowed = await borrowCollection.findOne({
    bookId: data.bookId,
    borrowerEmail: data.borrowerEmail,
    status: "Borrowed"
  });

  if (alreadyBorrowed) {
  return res.status(400).send({
    message: "You have already borrowed this book!"
  });
}
    const updateResult = await bookCollection.updateOne(
    {
    _id: new ObjectId(data.bookId),
    totalCopies: { $gt: 0 }
  },
    
  { $inc: { totalCopies: -1 } }
  )
  if (updateResult.matchedCount === 0) {
    return res.status(400).send({ message: "No copies available!" });
}
    const result = await borrowCollection.insertOne(data);
    console.log(result);
    res.send(result)
})


// return borrow
app.patch("/borrows/:id", verifyToken, async (req, res) => {
  const id = req.params.id;

  const borrow = await borrowCollection.findOne({
    _id: new ObjectId(id),
    status: "Borrowed",
  });

  if (!borrow) {
    return res.status(400).send({
      message: "Book already returned!",
    });
  }

  const updateResult = await borrowCollection.updateOne(
  {
    _id: new ObjectId(id),
    status: "Borrowed"
  },
  { $set: { status: "Returned" } }
);

if (updateResult.modifiedCount === 0) {
  return res.status(400).send({
    message: "Book already returned!"
  });
}

  await bookCollection.updateOne(
    { _id: new ObjectId(borrow.bookId) },
    { $inc: { totalCopies: 1 } }
  );

  res.send({ message: "Book returned successfully!" });
});


// my-borrows
app.get('/my-borrows/:email', verifyToken, async(req, res) => {
  const {email} = req.params
  const result = await borrowCollection.find({borrowerEmail : email, status: "Borrowed"}).toArray()
  res.send(result)
})

//one book at a time
app.get('/books/:id', verifyToken, async(req, res) => {
  const {id} = req.params
  const result = await bookCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})

// my-books by email
app.get('/my-books/:email',verifyToken, async(req, res) => {
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

export default app
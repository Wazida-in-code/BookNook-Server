import express from 'express'
import 'dotenv/config'

const app = express()
const PORT = 8000


app.get('/', (req, res) => {
    res.send({msg: "Server running perfectly!"})
})


app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
})
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;


app.use(express());
app.use(cors());


app.get('/', (req, res) => {
    res.send('hello world -job portal server is here')
})
app.listen(port , () => {
    console.log('job-portal server running on port', port)
})
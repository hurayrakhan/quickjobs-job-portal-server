require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(express());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4kv6tdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// verify firebase token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded
    next()
  }
  catch (error) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
};


const verifyTokenEmail = (req, res, next) => {
  if (req.query.email !== req.decoded.email) {
    return res.status(403).send({ message: 'forbidden access' })
  }
  next()
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db('job_portal_db').collection('jobs');

    // get all data 
    app.get('/jobs', async(req, res) => {
        const cursor =  jobCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    });

    // get a single data by id
    app.get('/jobs/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await jobCollection.findOne(query);
        res.send(result)
    })

    // delete data
    app.delete('/jobs/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('hello world -job portal server is here')
})
app.listen(port , () => {
    console.log('job-portal server running on port', port)
})


/*
for JWT

1 we need to install jsonWebToken first (npm install jsonwebtoken)
2 write (const jwt = require("jsonwebtoken");)
3 


From client side
send the information(email, ) to generate token

useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if(currentUser?.email){
              const userData = currentUser.email;
              axios.post('localhost:3000/jwt', userData, {withCredentials: true})
              .then(res => console.log(res.data))
              .catch(error => {
                console.log(error)
              })
            }
        });
        return () => unsubscribe();
    }, []);


    for fetch use {credentials: 'include'}


Then receive data from server side
1 create jwt api

app.post('/jwt', async(req, res) => {
  const userData = req.body;
  const token = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, {expiresIn: '1d'})
})

2 in the cors setting set credentials and origin

app.use(cors({
    origin: ['client side localhost address'],
    credentials:true
}))


3 after generating the token set it to the cookie with some options

need to install cookie-parser

require cookieParser

res.cookie('Token', token, {
    httpOnly: true,
    secure:false
})

use cookie-parser as middleWere
*/ 

const express = require('express')
const multer = require('multer')
const path = require('path'); 

/*
The dest option specifies the destination directory where uploaded files will be stored. However, in your case, you're using the upload.single() middleware to handle a single file upload, and you're specifying the field name as 'blogThumbnail'. This means you're not utilizing the dest option effectively.

To fix this, you can modify your multer configuration to specify the destination directory in the dest option while keeping the upload.single() middleware intact. Here's the updated code:

With this change, multer will use the specified destination directory (uploads/) to store the uploaded file. The filename function ensures that the original name of the file is used as the filename when saving it.
*/


const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: storage });
  
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 3000
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING
    dbName = 'Blogs'


MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/', (request, response) => {
    db.collection('blogs').find().toArray()
    .then(data => {
        response.render('index.ejs', {info: data})
    })
    .catch(error => console.log(error))
})


app.get('/images/:imageName', (request, response) => {
    const imageName = request.params.imageName;
    // response.sendFile(path.join(__dirname, 'uploads', imageName));
    db.collection('blogs').findOne({ thumbnail: imageName }) // find the doc that has that image and respond with that image
    .then(blog => {
        if (blog) {
            response.sendFile(path.join(__dirname, 'uploads', blog.thumbnail))
        } else {
            response.status(404).send('Image not found')
        }
    })
    .catch(error => {
        console.log(error)
        response.status(500).send('Internal server error')
    })
});

app.post('/addblog', upload.single('blogThumbnail'), (request, response) => {
    db.collection('blogs').insertOne({
        title: request.body.title,
        desc: request.body.description,
        thumbnail: request.file.filename,
        likes: 0
    })
    .then(result => {
        console.log('Blog added')
        response.redirect('/')
    })
    .catch(error => console.log(error))
})

app.put('/addOneLike', (request, response) => {
    db.collection('blogs').updateOne({title: request.body.titleBlog, desc: request.body.descBlog, likes:request.body.likesBlog},{
        $set: {
            likes: request.body.likesBlog + 1
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Added One Like')
        response.json('Like Added')
    })
    .catch(error => console.log(error))
})


app.delete('/deleteBlog', (request, response) => {
    db.collection('blogs').deleteOne({
        title: request.body.titleBlog
    })
    .then(result => {
        console.log('Blog Deleted')
        response.json('Blog Deleted')
    })
    .catch(error => console.log(error));
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
require('dotenv').config();
const express = require("express")
const mysql = require("mysql");
const multer = require('multer');
const cors = require('cors')
const app = express();
const path = require("path");

app.use(express.json()) 
app.use(cors())
const isProduction = process.env.NODE_ENV === "production";
app.use("/uploads",express.static("./uploads"))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,"./uploads"))
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now()+ Math.random().toString();
    cb(null, uniquePrefix+file.originalname)
  }
})

const upload = multer({ storage: storage })

const db = mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
})

app.get("/doc-data", (req, res) => {

   
    const query = "select * from doctordata";
    db.query(query, (err, rows) => {
      if (err) {
        res.send(err);
      } else {
        res.send( rows ); 
      }
    });
  });


app.post('/add-doctor', upload.single('imgname'), (req, res) => {
    const {name, city, state,mobile } = req.body;
    const {filename} = req.file
    

    const query = 'INSERT INTO doctordata (imgname, name, city, state, mobile) VALUES (?, ?, ?,?,?)';
    db.query(query, [filename,name, city,state, mobile], (error, results) => {
      if (error) {
        console.error('Error saving image data: ', error);
        res.status(500).json({ error: 'Failed to save image data' });
        return;
      }
  
      res.status(200).json({ message: 'doctor added uploaded successfully' });
      console.log(results)
    });
  });
  

  // select singal doctor 

  app.get("/getdoctor/:id", (req,res)=>{
    const id = req.params.id;
    const selectQuery = "select * from doctordata where id=?"
    try {
        db.query(selectQuery,[id],(err,rows)=>{
            if(err){
                console.log(err)
            }
            else{
                res.send(rows)
            }
        })
    } catch (error) {
       res.send(error) 
    }
})

 
  app.delete("/delete/:id", (req,res)=>{
    const id = req.params.id;
    const deleteQuery = "delete from doctordata where id=?"
    try {
        db.query(deleteQuery,[id],(err,rows)=>{
            if(err){
                console.log(err)
            }
            else{
                res.send(rows)
            }
        })
    } catch (error) {
       res.send(error) 
    }
})

//final update
app.patch("/update/:id", (req, res) => {
    
   const {name,city,state,mobile} = req.body
  
    const updateQuery = "update doctordata set name=?, city=? state=? mobile=? where id=?";
  
    db.query(
      updateQuery,
      [name, city,state,mobile, req.params.id],
      (err, rows) => {
        if (err) {
          res.send(err);
        } else {
          res.send(rows);
        }
      }
    );
  });

app.listen(8081,()=>{
    console.log("listining...")
})
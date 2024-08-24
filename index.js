
const { faker } = require("@faker-js/faker");
const mysql= require("mysql2");
const express=require("express");

const app=express();
app.set("views engine","ejs");
const path=require("path");
app.set("views", path.join(__dirname,"/views"));
const methodOverride=require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


const connection =mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"delta_app",
    password:"3301"
});

// fake data generation
let  getRandomUser=()=> {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
       faker.internet.email(),
     faker.internet.password(),
    ]  
};

// HOME PAGE 
app.get("/",(req,res)=>{
    let q=`SELECT COUNT(*) FROM user`;
    try{
    connection.query(q, (err,result)=>{
        if(err) throw err;
       let count=result[0]["COUNT(*)"];     //or result[0].key can also be written to print only count value
        res.render("home.ejs",{count});
    });
  } catch(err){
    console.log(err);
    res.send("some error in DB");
  }

});


// SHOW ALL USERS
app.get("/user",(req,res)=>{
    let q=`SELECT * FROM user`;
    try{
    connection.query(q, (err,result)=>{
        if(err) throw err;
        let users=result; 
        res.render("users.ejs",{users});
    });
  } catch(err){
    console.log(err);
    res.send("some error in DB");
  }

});

// ADD NEW USER
app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});

app.post("/user",(req,res)=>{
  try{
    const { id, email, username, password } = req.body;
    let q2=`INSERT INTO user(id,email,username,password) VALUES (?,?,?,?)`
    connection.query(q2, [id, email, username, password],(err,result)=>{
     if (err) throw err;
       res.redirect("/user");
    })
  }
  catch(err){
    console.log(err);
          res.send("COULD NOT ADD ANY NEW DATA!! TRY AGAIN");
        }
  });


// DELETE ROUTE
// Route to render delete page
app.get("/user/delete/:id", async (req, res) => {  // Use req.params.id for accessing id from URL
  let { id } = req.params;
  console.log(id);
  let q = `SELECT * FROM user WHERE id = ?`;

  try {
      connection.query(q, [id], (err, result) => {
          if (err) throw err;
          if (result.length === 0) {
              return res.status(404).send("User not found");
          }
          let user = result[0];
          res.render("delete.ejs", { user });
      });
  } catch (err) {
      console.log(err);
      res.send("Some error occurred in the database");
  }
});

// Route to handle delete action
app.delete("/user/:id", async (req, res) => {
  let {id}=req.params;
  let q=`SELECT * FROM user WHERE id="${id}"`;
  let {password:formPass}=req.body;
  try{
      connection.query(q, (err,result)=>{
          if(err) throw err;
        let user=result[0]; 
        if(formPass!=user.password){
          res.send("WRONG PASSWORD");
        }
        else{
          // to delete value from databse
          let q2=`DELETE from user  WHERE id='${id}'`;
          connection.query(q2,(err,result)=>{
           if (err) throw err;
             res.redirect("/user");
             console.log("succesfully deleted",id)
          })
        }
      });

    } catch(err){
      console.log(err);
      res.send("some error in DB");
    }
});





//  EDIT ROUTE
app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    console.log(id);
    let q=`SELECT * FROM user WHERE id="${id}"`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
          let user=result[0]; 
            res.render("edit.ejs",{user});
        });
      } catch(err){
        console.log(err);
        res.send("some error in DB");
      }
   
});




// UPDATE ROUTE IN DB
app.patch("/user/:id",(req ,res)=>{
    let {id}=req.params;
    console.log(id);
    let q=`SELECT * FROM user WHERE id="${id}"`;
    let {password:formPass,username:newUsername}=req.body;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
          let user=result[0]; 
          if(formPass!=user.password){
            res.send("WRONG PASSWORD");
          }
          else{
            // to UPDATE edited value into databse
            let q2=`UPDATE user SET username ='${newUsername}' WHERE id='${id}'`;
            connection.query(q2,(err,result)=>{
             if (err) throw err;
               res.redirect("/user");
            })
          }
        });

      } catch(err){
        console.log(err);
        res.send("some error in DB");
      }

});





// PORT
app.listen ("8080",()=>{
    console.log(`listening to port 8080`);
})





// closing mysql connction automatically when ctr +C is clicked
// connection.end();
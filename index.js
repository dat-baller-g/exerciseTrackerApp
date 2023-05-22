const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const https = require("https")

app.use(cors())
app.set('view engine', 'ejs');
app.use(express.static('Public'))
app.use(bodyParser.urlencoded({extended:true}));

const mySecret = process.env.MONGO_URI

mongoose.connect(mySecret, {useNewUrlParser: true, useUnifiedTopology: true});


const userSchema = new mongoose.Schema({
  userName: String,
  description: String,
  duration: Number,
  date: String,
  log: {type: Array},
  count: Number
});

var User = mongoose.model('User', userSchema);

app.get('/', async function(req, res){
  res.render('signInPage')

});

// async function connectionIsUp(): Promise<boolean> {
//     try {
//         return await connection.db.admin().ping().then(res => !!res?.ok === 1)
//     } catch (err) {
//         return false
//     }
// }

app.post('/api/users', async (req, res)=>{
  var userName = req.body.username;
  console.log(mongoose.connection.readyState)
  console.log(userName);
  var user = await User.findOne({userName: userName});
  try{
    if(user){
      res.send("Please select a different username, this username has been taken.")
    }else{
      user = new User({
        userName
      });
      await user.save();
      res.render("index", {username: user.userName, _id: user.id})
    }
  }catch(err){
      console.error(err.message);
      return res.status(500).json("Internal Server error " + err.message);
    }

});

app.post("/api/user", async function(req, res){
  var username = req.body.user;
  console.log(username);
  try{
    var user = await User.findOne({userName: username});
    if(user){
      //let count = user.log.length;
      res.render("index", {username: user.userName, _id: user.id})
    }else{
      res.send("User not found, register username.")
    }
  }catch(err){
    console.error(err.message);
    return res.status(500).json("Internal Server error " + err.message);
  }




  // var user = await Client.find({}, {clientName: 1});
  // console.log(user);
  // var myuser = JSON.stringify(user);
  // console.log(myuser);
  // res.send(myuser)
  // res.write(JSON.stringify(user));
  //res.sendFile(__dirname + "/logPage.html")
});

app.post("/api/user/home", async function (req, res) {
  let username = req.body.homePageBtn
  console.log(username);
  try{
    var user = await User.findOne({userName: username});
    if(user){
      //let count = user.log.length;
      res.render("index", {username: user.userName, _id: user.id})
    }else{
      res.send("User not found, register username.")
    }
  }catch(err){
    console.error(err.message);
    return res.status(500).json("Internal Server error " + err.message);
  }

})

app.get("/api/myusers", async function(req, res){
  var user = await User.find({}, {userName: 1});
  console.log(user);
  // var myuser = JSON.stringify(user);
  // console.log(myuser);
  res.json(user)
  // res.write(JSON.stringify(user));
  // res.sendFile(__dirname + "/logPage.html")
});


app.post('/api/users/:username/exercise', async (req, res) => {
  var userName = req.body.submit;
  var description = req.body.description;
  var duration = req.body.duration;
  var dateInput = req.body.date;
  var newDate = new Date(dateInput);
  var date = newDate.toDateString();

  console.log(userName, description, duration, date);

  if(dateInput === ""){
    var newDate = new Date();
    var date = newDate.toDateString()
  }

  try{
    var user = await User.findOne({userName: userName})
    console.log(user);
    if(user){
      var findLog = await User.findOne({userName: userName});
      var log = JSON.stringify(findLog.log);

      var findCount = await User.findOne({userName: userName});
      var count = findCount.log.length + 1;
      // var log = client.log;
      // console.log(log)
      // var count = client.log.length + 1;
      var userInput = await User.findOneAndUpdate({userName: userName}, { "$set":{description: description, duration: duration, date: date, count: count}, "$push": { log:{ description: description, duration: duration, date: date}} }, { fields: 'userName description duration date', new: true});
        res.render("logpage", {Username: userName, Count: count, ExerciseLog: userInput.description, ExerciseDuration: userInput.duration, ExerciseDate: userInput.date});
      //res.json(clientInput);
       //res.sendFile(__dirname + "/exercisePage.html")
    }
  }catch(err){
    console.error(err.message);
    return res.status(500).json("Internal Server error " + err.message);
  }


  // var findLog = await Client.findOne({clientName: clientName})


});

// app.get("/api/users/:username/exercise", async function(req, res){
//   let clientName = req.params.username;
//   res.sendFile(__dirname + "/exercisePage.html")
// })

app.get("/api/users/:username/exercise", async function(req, res){
  let userName = req.params.username;
  console.log(userName);
  try{
    var user = await User.findOne({userName: userName});
    if(user){
      var log = JSON.stringify(user.log);
      let count = user.log.length;
      //res.send({Username: userName, Count: count, ExerciseLog: user.log});
      res.render("exerciseLogPage", {exerciseLog: user.log})
    }else{
      res.send("You have not logged in any exercise. Please login exercise details.")
    }
  }catch(err){
    console.error(err.message);
    return res.status(500).json("Internal Server error " + err.message);
  }

});

app.post("/api/users/:username/logs", async (req, res)=>{
  var userName = req.body.viewSpecificLogButton;
  var froms = req.body.from;
  var tos = req.body.to;
  var limit = req.body.limit;
  console.log(userName, froms, tos, limit);
  try{
  var user = await User.findOne({userName: userName});
  if(user){
    var log = user.log
    function getLog(from, to, arr){
          let arry = [];
          let fromDate = Date.parse(from)
          console.log(from);
          let toDate = Date.parse(to);
          for(i=0; i<arr.length; i++){
            console.log(Date.parse(arr[i].date))
            if(Date.parse(arr[i].date) >= fromDate && Date.parse(arr[i].date) <= toDate){
               console.log(arr[i]);
                arry.push(arr[i]);
            }
          }
        return arry
      };

        function getFromLog(from, arr){
          let arry = [];
          let fromDate = Date.parse(from);
          for(i=0; i<arr.length; i++){
              if(Date.parse(arr[i].date) >= fromDate){
                  arry.push(arr[i])
              }
            }
          return arry
        };

        function getToLog(to, arr){
          let arry = [];
          let toDate = Date.parse(to);
          for(i=0; i<arr.length; i++){
              if(Date.parse(arr[i].date) <= toDate){
                  arry.push(arr[i])
              }
            }
          return arry
        };
        if(froms === '' || froms === undefined && tos === '' || tos === undefined){
                    // res.write(JSON.stringify({
                    //   _id: user._id,
                    //   username: userName,
                    //   count: log.slice(0, limit).length,
                    //   log: log.slice(0, limit)
                    // }));
                    res.render("exerciseLogPage", {exerciseLog: log.slice(0, limit)})
                  }
                  // else if(froms === undefined || froms === '' && limit === undefined || limit === '') {
                  //   let thisArray = getToLog(tos, log);
                  //   res.render("exerciseLogPage", {exerciseLog: thisArray})
                  // }
                  else if(froms === undefined || froms === ''){
                    let thisArray = getToLog(tos, log)
                    // res.write(JSON.stringify({
                    //   _id: user._id,
                    //   username: userName,
                    //   to: tos,
                    //   count: thisArray.slice(0, limit).length,
                    //   log: thisArray.slice(0, limit)
                    // }));
                    res.render("exerciseLogPage", {exerciseLog: thisArray.slice(0, limit)})
                  }else if(tos === undefined || tos === '' && limit === undefined || limit === ''){
                    let thisArray = getFromLog(froms, log)
                    console.log(thisArray);
                    res.render("exerciseLogPage", {exerciseLog: thisArray});
                  }else if(tos === undefined || tos === ''){
                    console.log(limit);
                    let thisArray = getFromLog(froms, log)
                    // res.write(JSON.stringify({
                    //   _id: user._id,
                    //   username: userName,
                    //   from: froms,
                    //   count: thisArray.slice(0, limit).length,
                    //   log: thisArray.slice(0, limit)
                    // }));
                    res.render("exerciseLogPage", {exerciseLog: thisArray.slice(0, limit)})
                  }else if(limit === undefined || limit === ''){
                    // res.write(JSON.stringify({
                    //   _id: user.id,
                    //   username: userName,
                    //   count: log.length,
                    //   log: log
                    // }));
                   res.render("exerciseLogPage", {exerciseLog: log})
                  }else{
                      var myArray = getLog(froms, tos, log);
                      console.log(myArray);
                      // res.write(JSON.stringify({
                      // _id: user._id,
                      // username: userName,
                      // from: froms,
                      // to: tos,
                      // count: myArray.slice(0, limit).length,
                      // log: myArray.slice(0, limit),
                      // }));
                    res.render("exerciseLogPage", {exerciseLog: myArray.slice(0, limit)})
                    }

                    // res.end();
              }else{
                  res.send("User not found, register username.")
              }


  }catch(err){
    console.error(err.message);
       return res.status(500).json("Internal Server error " + err.message);
    }
});

// app.get("/api/users/:username/logs", async (req, res)=>{
//   var userName = req.body.viewSpecificLogButton;
//   //var userName = req.body.viewLogButton
//   console.log(userName);
//   try{
//     var user = await User.findOne({userName: userName});
//     if(user){
//       var count = user.log.length;
//       var url =`${req.protocol}://${req.get('host')}${req.originalUrl}`;
//       var urlRegex = /logs$/;
//       if(urlRegex.test(url)){
//         res.write(JSON.stringify({Username: userName, Count: count, ExerciseLog: user.log}));
//       }else{
//       var firstDate = req.query.from;
//       var lastDate = req.query.to;
//       var limit = req.query.limit;
//       var userName = user.userName;
//       var log = user.log;
//       function getLog(froms, tos, arr){
//           let arry = [];
//           let from = Date.parse(froms)
//           console.log(from);
//           let to = Date.parse(tos);
//           for(i=0; i<arr.length; i++){
//             console.log(Date.parse(arr[i].date))
//             if(Date.parse(arr[i].date) >= from && Date.parse(arr[i].date) <= to){
//                console.log(arr[i]);
//                 arry.push(arr[i]);
//             }
//           }
//         return arry
//       };
//
//         function getFromLog(froms, arr){
//           let arry = [];
//           let from = Date.parse(froms);
//           for(i=0; i<arr.length; i++){
//               if(Date.parse(arr[i].date) >= from){
//                   arry.push(arr[i])
//               }
//             }
//           return arry
//         };
//
//         function getToLog(tos, arr){
//           let arry = [];
//           let to = Date.parse(tos);
//           for(i=0; i<arr.length; i++){
//               if(Date.parse(arr[i].date) <= to){
//                   arry.push(arr[i])
//               }
//             }
//           return arry
//         };
//
//         if(firstDate === '' || firstDate === undefined && lastDate === '' || lastDate === undefined){
//             res.write(JSON.stringify({
//               _id: user._id,
//               username: userName,
//               count: log.slice(0, limit).length,
//               log: log.slice(0, limit)
//             }));
//           }else if(firstDate === undefined || firstDate === ''){
//             let thisArray = getToLog(lastDate, log)
//             res.write(JSON.stringify({
//               _id: user._id,
//               username: userName,
//               to: lastDate,
//               count: thisArray.slice(0, limit).length,
//               log: thisArray.slice(0, limit)
//             }));
//           }else if(lastDate === undefined || lastDate === ''){
//             let thisArray = getFromLog(firstDate, log)
//             res.write(JSON.stringify({
//               _id: user._id,
//               username: userName,
//               from: firstDate,
//               count: thisArray.slice(0, limit).length,
//               log: thisArray.slice(0, limit)
//             }));
//           }else if(limit === undefined || limit === ''){
//             res.write(JSON.stringify({
//               _id: user.id,
//               username: userName,
//               count: log.length,
//               log: log
//             }));
//           }else{
//               var myArray = getLog(firstDate, lastDate, log);
//               console.log(myArray);
//               res.write(JSON.stringify({
//               _id: user._id,
//               username: userName,
//               from: firstDate,
//               to: lastDate,
//               count: myArray.slice(0, limit).length,
//               log: myArray.slice(0, limit),
//               }));
//             }
//       }
//       res.end();
//
//
//     }else{
//       res.send("User not found, register username.")
//     }
//
//   }catch(err){
//     console.error(err.message);
//     return res.status(500).json("Internal Server error " + err.message);
//   }
//
// });
//
//


app.listen(4000, function(){
  console.log("Your app is listening on port 4000")
})

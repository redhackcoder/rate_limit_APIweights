let express = require('express');
let {MongoClient} = require('mongodb');
let app = express();
const http = require('http');
const mongoUrl = 'mongodb://localhost:27017/';
const mongoClient = new MongoClient(mongoUrl);
var rateLimit = require("express-rate-limit");

let cacheTime
/* GET home page. */
const limiter = rateLimit({
    windowMs: 60*1000,
    max: 100,
    message:":)"
})
app.get('/weight',limiter ,async (req, res, next)=> {
  await mongoClient.connect();
  let companyName = req.query.companyName
  var APIweight=(req.query.weight !=undefined?req.query.weight:1)
  let seasonData = await mongoClient.db('wfx').collection('neoCompany').find({"companyName":companyName}).toArray();
  console.log(seasonData[0].companyWeight,seasonData[0].companyTime)
  if( seasonData[0].companyTime && seasonData[0].companyTime > Date.now()- 60*1000 ){
    let weight= seasonData[0].companyWeight;
    if(weight>0){
      
      weight= seasonData[0].companyWeight - parseInt(APIweight);
      console.log(weight)
      res.send("You have limit")
      let companyname1 =  await mongoClient.db('wfx').collection('neoCompany').findOneAndUpdate(
        { 
          "companyName":seasonData[0].companyName },
        {
          $set: {
            companyWeight: weight
          }})
      console.log(companyname1)
      
    }else{
      return res.send("cached Time")
    }
    
  }
  else{
    let companyname1 =  await mongoClient.db('wfx').collection('neoCompany').findOneAndUpdate(
      { 
        "companyName":seasonData[0].companyName },
      {
        $set: {
          companyWeight: 20,
          companyTime:Date.now()
        }})
    console.log(companyname1)
    return res.send("dsc");
  }
  
});
/* GET home page. */
app.get('/mongo',limiter ,async (req, res, next) => {
  var weight=  parseInt(req.query.weight)
  await mongoClient.connect();
console.log(weight)
  let seasonData = await mongoClient.db('wfx').collection('neoCompany').find().toArray();
  console.log(seasonData[0].companyWeight)
  weight= seasonData[0].companyWeight - weight;
  if(weight>0){
  
  console.log(weight)
  res.send("You Have  your limit")
  let companyname1 =  await mongoClient.db('wfx').collection('neoCompany').findOneAndUpdate(
    { 
      "companyName":seasonData[0].companyName },
    {
      $set: {
        companyWeight: weight
      }})
  console.log(companyname1)
}
else{
  let companyname1 =  await mongoClient.db('wfx').collection('neoCompany').findOneAndUpdate(
    { 
      "companyName":seasonData[0].companyName },
    {
      $set: {
        companyWeight: 20
      }})
  res.send("You Have exceed your limit",companyname1)
}
})

app.listen(7000, () => {
    console.log(`App is listening at 7000`);
});

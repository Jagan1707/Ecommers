const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); 
const user = require('./routes/user.route')
const Electronics = require('./routes/Electronic.route'); 
const { required } = require('joi');
// const order = require('./routes/order.routes');
// const cart = require('./routes/cart.route');
const order = require('./routes/order');


const app = express();
app.use(cors());
app.use(express.json())

app.get('/',async(req,res)=>{
    console.log('success');
    res.json({status:'success'});
});

let dburl = process.env.DB
mongoose.connect(dburl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(db =>{
    console.log('dataBase connected start.....')
}).catch(err=>{
    console.log(err.message);
    process.exit(1);
})

app.use('/api/v1',user)
app.use('/api/v2',Electronics)
app.use('/api/v3',order)
// app.use('/api/v4',cart)



app.listen(7000,()=>{
    console.log('server started......')
})

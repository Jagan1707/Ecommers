const router = require('express').Router();
const elecSchema = require('../models/Electronics.model')
const categorySchema = require('../models/ElecCategory.model')
const {authVerify,isAdmin} = require('../middleware/auth')
const {sendNotifi} = require('../middleware/notification')
//const sendnotification =require('../utill/notifi.json')

 router.post('/addItems',authVerify,async(req,res)=>{
   // router.post('/addItems',async(req,res)=>{
    try{
        const data = new elecSchema(req.body)
        const save = await data.save()
        // let message = {
        //     Notification : {
        //         tittle : req.body.tittle,
        //         message : `$(re.body.brand) $(sendnotification.addItems)`,
        //         body : req.body.bodyMsg
        //     }
        // }
       // await sendNotifi(message);
           if(save){
            res.json({status:'success',message:'product is successfully added!',"data":save})
           }else{
            res.json({status:'failure',message:'product are not added'})
           }
        
    }catch(err){
        res.json({'message':err.message})
    }
})

router.post('/addCategory',isAdmin,async(req,res)=>{
try{
    const category = new categorySchema(req.body)
    const save = await category.save()
    if(save){
        res.json({status:'success',message:'categorys successfully added!','result':save})
    }else{
        res.json({status:'failure',message:'categories is not added!'})
    }
}catch(err){
    res.json({"error":err.message})
}
})

router.delete("/delete-Category",isAdmin,async (req, res) => {
    try {
      const uuid = req.query.uuid
      await categorySchema.findOneAndDelete(uuid);
      res.json("Order has been deleted...");
    } catch (err) {
      res.json(err);
    }
  });

router.get('/showAllitems',authVerify,async(req,res)=>{
    try{
        await elecSchema.find().exec().then(data=>{
            res.json({status:'success',message:'show All items',"data":data})
        })
    }catch(err){
        res.json({'error':err.message});
    }
})

router.get('/categoryBassedItem',async(req,res)=>{
try{
    const itemFetched =  await categorySchema.aggregate([
        {
            $lookup:{
                from : 'electronics',
                localField : 'uuid',
                foreignField : 'categoryUuid',
                as:'items_Details'
            },      
            
        },
        {
            $lookup:{
                from:'users',
                localField:'adminUUid',
                foreignField:'uuid',
                as:'admin_details'
            }
        },
        {
            $project:{
                "_id":0,
                "adminUUid":0,
                "createdAt":0,
                "updatedAt":0,
                "uuid":0,
                "__v":0
            }
        },
        {
            $sort:{category:-1}
        },
    ])
if(itemFetched){
    res.json({status:'success',message:'category bassed all items fetched successfull!','result':itemFetched})
}else{
    res.json({status:'failure',message:'items are not fetched'})
}
}catch(err){
    res.json({'error':err.message})
}
})

//search Individual product
router.get('/searchItems',async(req,res)=>{
    try{
        const itemName = req.query.itemName
        const item = await elecSchema.findOne({Brand:itemName}).exec()
        if(item){
            console.log("success");
            res.json({status:"success",'result':item})
        }else{
            res.json({status:'failure',message:'This product not avalible!'})
        }

    }catch(err){
        res.json({"error":err.message})
    }
})


router.get('/getAllItems',async(req,res)=>{
    try{
        await elecSchema.find().exec().then(data=>{
            res.json({status:'success',message:'you got a all products',"result":data})
        }).catch(err=>{
            res.json({status:'success',message:err.message})
        })
    }catch(err){
        res.json({"error":err.message});
    }
})


//filter
router.get('/filterPrice',async(req,res)=>{
    try{
        let min = req.query.min
        let max = req.query.max
        let mini = parseInt(min);
        let maxi = parseInt(max);

        const itemFilter = await elecSchema.aggregate([
            
        {
            $match:{
                $and:[
                     
                     { cost: {
                        $gte: mini,
                        $lte: maxi
                     }, 
                     },
                ],
            },
        },
        {
            $sort:{cost:1}
        }, {
            $project:{
                "_id":0,
                "adminUuid":0,
                "categoryUuid":0,
                "createdAt":0,
                "updatedAt":0,
                "uuid":0,
                "__v":0
            }
        }
        
        ])
        //  await elecSchema.find().then(data=>{
        //  res.json({status:'success',message:'see all Electronic bassed TV , Laptop and Mobiles phone',"data":data})
        //  })

        if(itemFilter){
            res.json({status:'success',message:'you got a items','result':itemFilter})
        }else{
            res.json({status:'failure',message:err.message});
        }
    }catch(err){
        res.json({'error':err.message})
    }
})


router.post('/updateItems',isAdmin,async(req,res)=>{
try{
    const uuid = req.body.uuid
    await elecSchema.findOneAndUpdate({uuid:uuid},req.body,{new:true}).exec().then(result=>{
        res.json({status:'success',message:'items are updated successfull!','result':result})
    })
}catch(err){
    res.json({"error":err.message})
}

})


router.post('/deleteItems',isAdmin,async(req,res)=>{
    try{
        await elecSchema.findOneAndDelete({uuid:req.query.uuid}).exec()
        res.json({status:'success',message:'items are successfully delted!'})
    }catch(err){
        res.json({'error':err.message})
    }
})



module.exports = router
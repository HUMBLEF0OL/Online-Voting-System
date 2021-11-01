const express = require("express");
const db = require('../../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash'); 

const candidate_register_get =  async function(req,res)
{
  const pageAsNumber = Number.parseInt(req.params.pagen);
  let page = 0;
  let size = 6; //number of records per page
  if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
    page = pageAsNumber;
  }
  const elections = await db.election_data.findAll({
    limit: size,
    offset: page * size,
    where: {
      status: "not_started"
    },
    order:  [['election_id', 'DESC']]

  });
  const totalElection = await db.election_data.count({
    where: {
      status: ["not_started","running"],
    },
  });
  const totalPages =  Math.ceil(totalElection/ Number.parseInt(size));
  res.render('./election_admin/candidates/reg1',{elections,totalPages,page,alertsm : ""});
  
}




const candidate_register_get2 =  async function(req,res)
{
  
   var eid=req.params.eid;
  try {

    const positions = await db.position_data.findAll({
      where: {
        election_id: eid
      },
      order:  [['position_name', 'ASC']]
  
    });
    
 
      res.render('./election_admin/candidates/reg2',{positions,eid,alerte:"",alertsm : ""});
        //res.send(positions);

  } catch (error) 
  {
  
     console.log(error);
  }
   


  
  
}


//save position details

const save_candidate= async function(req,res){

  var params = req.body
  var eid=params.election_id;


 
  
  console.log(params);
  
 
 //validate user detail   
 const users = await db.user_data.findOne({
  where: {
    identification: req.body.identification
  }

})
 
if (_.isEmpty(users))
{


  const positions = await db.position_data.findAll({
    where: {
      election_id: eid
    },
    order:  [['position_name', 'ASC']]

  });
  res.render('./election_admin/candidates/reg2',{eid,positions,alerte:"Error! User not Found",alertsm : ""});

}
else {

  params.user_id=users.user_id;

  console.log(params);
  console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n "+req.body.position_id);
  const existing = await db.candidate_data.findAll({
      where: {
        election_id: eid,
        position_id:req.body.position_id,
        user_id:params.user_id
      }
      
  
    });

    const positions = await db.position_data.findAll({
      where: {
        election_id: eid
      },
      order:  [['position_name', 'ASC']]
  
    });
    if(existing.length>0)
    {
      res.render('./election_admin/candidates/reg2',{positions,eid,alerte:"",alertsm : "Candidate Already Registered"});

    }
    else{
      //saving election data to database
      await db.candidate_data.create(params).catch(function(err){
        console.log(err)
        });
        res.render('./election_admin/candidates/reg2',{positions,eid,alerte:"",alertsm : "Candidate Registered Successfully"});

    }
  


 
  }

 
}



//candidate manager
const manage = async function(req,res)
{
  const pageAsNumber = Number.parseInt(req.params.pagen);
  let page = 0;
  let size = 6; //number of records per page
  if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
    page = pageAsNumber;
  }
    
  var eid=req.params.eid;

  const positions = await db.position_data.findAll({
    limit: size,
    offset: page * size,
    include: ['candidate','election'] ,  required: true , where :{ election_id : eid} 
  });

  const totalPositions = await db.position_data.count({
    where: {
      election_id : eid
    },
  });
  const totalPages =  Math.ceil(totalPositions/ Number.parseInt(size));
     //res.send(positions);
    res.render('./election_admin/candidates/manage',{positions,totalPages,page,eid,alertsm : ""});
  
}


//candidate manager2
const manage2 = async function(req,res)
{

    
  var pid=req.params.pid;
  var eid=req.params.eid;
  const pageAsNumber = Number.parseInt(req.params.pagen);
  let page = 0;
  let size = 6; //number of records per page
  if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
    page = pageAsNumber;
  }
    
  
  

  const candidates = await db.candidate_data.findAll({
    limit: size,
    offset: page * size,
    include: ['position','user_info'] ,  required: true , where :{ position_id : pid} 
  });

  const totalCandidates = await db.candidate_data.count({
    where: {
      election_id : eid,
      position_id : pid
    },
  });
  const totalPages =  Math.ceil(totalCandidates/ Number.parseInt(size));
     //res.send(positions);
    res.render('./election_admin/candidates/manage2',{candidates,totalPages,page,eid,pid,alertsm : ""});
  
}









//delete election
const delete_candidate = async function(req,res)
{
    var cid=req.params.cid;
    var pid=req.params.pid;
  
    
    try
    {
      await db.candidate_data.destroy(
      {
        where: { candidate_id: cid }
      })

      var pid=req.params.pid;
      var eid=req.params.eid;
      const pageAsNumber = Number.parseInt(req.params.pagen);
      let page = 0;
      let size = 6; //number of records per page
      if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
        page = pageAsNumber;
      }
      const candidates = await db.candidate_data.findAll({
        limit: size,
        offset: page * size,
        include: ['position','user_info'] ,  required: true , where :{ position_id : pid} 
      });
    
      console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n working till now!"+pid+" "+req.params.eid);
     const totalCandidates = await db.candidate_data.count({
      where: {
        // election_id : req.params.eid,
        position_id : req.params.pid
      },
    });
    const totalPages =  Math.ceil(totalCandidates/ Number.parseInt(size));
    res.render('./election_admin/candidates/manage2',{candidates,totalPages,page,pid,eid,alertsm : "Candidate Deleted Successfully"});
  

    }catch(err){console.log(err)}
     
   
}





//update candidate

const update_candidate_get =  async function(req,res)
{
  
   var eid=req.params.eid;
   var cid=req.params.cid;
   var uid=req.params.uid;
  try {

    const positions = await db.position_data.findAll({
      where: {
        election_id: eid
      },
      order:  [['position_name', 'ASC']]
  
    });
    

    const user_details = await db.user_data.findOne({
      where: {
        user_id: uid
      }

    });

    
 
      res.render('./election_admin/candidates/update_f',{user_details,positions,cid,eid,alerte:"",alertsm : ""});
        //res.send(positions);

  } catch (error) 
  {
  
     console.log(error);
  }
   


  
  
}

//update  candidate

const update_candidate= async function(req,res)
{

    

  try

{
   await db.candidate_data.update(
    {
      position_id: req.body.position_id 
    },
    {
      where: { candidate_id: req.body.candidate_id }
    });

    const pageAsNumber = Number.parseInt(req.params.pagen);
    let page = 0;
    let size = 6; //number of records per page
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
      page = pageAsNumber;
    }

    
    var eid=req.params.eid;

    
    const positions = await db.position_data.findAll({
      limit: size,
      offset: page * size,
      include: ['candidate','election'] ,  required: true , where :{ election_id : req.body.election_id } 
    });
    const totalPositions = await db.position_data.count({
      where: {
        election_id : req.body.election_id
      },
    });

    const totalPages =  Math.ceil(totalPositions/ Number.parseInt(size));
       //res.send(positions);
      res.render('./election_admin/candidates/manage',{positions,totalPages,page,eid,alertsm : "Candidate Updated Successfully"});
 


  }catch(err){console.log(err);}

}


//view all

const view_all =  async function(req,res)
{
  
   var eid=req.params.eid;
  try {

    const positions = await db.position_data.findAll({
      where: {
        election_id: eid
      },
      include :
      {
        model: db.candidate_data, as: 'candidate',
        include : { 
          model: db.user_data, as: 'user_info'
        }
      },
      order:  [['position_name', 'ASC']]
    });


    const disqualified = await db.candidate_data.count({
      where: {
        election_id: eid , status:'disqualified'
      }
    });

 
      res.render('./election_admin/candidates/view',{ disqualified,positions,eid,alerte:"",alertsm : ""});
        
  //       res.send(positions);

  } catch (error) 
  {
  
     console.log(error);
  }
   


  
  
}




//Disqualify  candidate

const disqualify_candidate= async function(req,res)
{

    

  try

{
   await db.candidate_data.update(
    {
      status:'disqualified'  
    },
    {
      where: { candidate_id: req.params.cid }
    });


    const pageAsNumber = Number.parseInt(req.params.pagen);
    let page = 0;
    let size = 6; //number of records per page
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
      page = pageAsNumber;
    }

    const positions = await db.position_data.findAll({
      limit: size,
      offset: page * size,
      include: ['candidate','election'] ,  required: true , where :{ election_id : req.params.eid } 
    });
    var eid=req.params.eid;
    const totalPositions = await db.position_data.count({
      where: {
        election_id : eid
      },
    });
    const totalPages =  Math.ceil(totalPositions/ Number.parseInt(size));
       //res.send(positions);
      res.render('./election_admin/candidates/manage',{positions,totalPages,page,alertsm : "Candidate Disqualified Successfully"});

  }catch(err){console.log(err);}

}









module.exports= {disqualify_candidate,view_all,candidate_register_get,candidate_register_get2,save_candidate,manage,manage2,delete_candidate,update_candidate_get,update_candidate}
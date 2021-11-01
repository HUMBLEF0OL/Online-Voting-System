const express = require("express");
const db = require('../../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash'); 

const positions_register_get =  async function(req,res)
{
  const pageAsNumber = Number.parseInt(req.params.pagen);
  let page = 0;
  let size = 10; //number of records per page
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
      status: "not_started"
    },
  });
  const totalPages =  Math.ceil(totalElection/ Number.parseInt(size));
  res.render('./election_admin/positions/reg1',{elections,totalPages,page,alertsm : ""});
  
}

const positions_register_get2 =  async function(req,res)
{
  
  var eid=req.params.eid;

  const positions = await db.position_data.findAll({
    where: {
      election_id: eid
    }
    ,include: ['election']
    
  });
  const election_title = await db.election_data.findOne({
    where: {
      election_id: eid
    }
    
  });
  res.render('./election_admin/positions/reg2',{eid,positions,election_title,alertsm : ""});
  
}



//positions manager
const manage = async function(req,res)
{
  const pageAsNumber = Number.parseInt(req.params.pagen);
  let page = 0;
  let size = 5; //number of records per page
  if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
    page = pageAsNumber;
  }
  var eid=req.params.eid;

  const positions = await db.position_data.findAll({
    limit: size,
    offset: page * size,
    where: {
      election_id: eid
    }
    ,include: ['election']
    
  });
  const totalPositions = await db.position_data.count({
    where: {
      election_id: eid
    }
  });
  const totalPages =  Math.ceil(totalPositions/ Number.parseInt(size));
    
  //res.send(positions);
   res.render('./election_admin/positions/manage',{positions,totalPages,page,eid,alertsm : ""});
  
}




//delete election
const delete_position = async function(req,res)
{
    var pid1=req.params.pid;
    var eid1=req.params.eid;
  
    
    try
    {
      await db.position_data.destroy(
      {
        where: { position_id: pid1 }
      });

      




      const positions = await db.position_data.findAll({
        where: {
          election_id: eid1
        },include: ['election']
        
      });

        res.render('./election_admin/positions/manage',{positions,alertsm : "Position Deleted Successfully"});
  

    }catch(err){console.log(err)}
     
   
}


//save position details

const save = async function(req,res){

  var temp = req.body.position_name;
  var params = req.body
  var eid=req.params.eid;
  const existing = await db.position_data.findAll({
    where:{
      election_id:eid,
      position_name:temp
    }
  });
  if(existing.length<1){
      db.position_data.create(params).catch(function(err){
        console.log(err)
        });

      const positions = await db.position_data.findAll({
        where: {
          election_id: eid
        }
        ,include: ['election']
        
      });
      const election_title = await db.election_data.findOne({
        where: {
          election_id: eid
        }
        
      });
      res.render('./election_admin/positions/reg2',{eid,positions,election_title,alertsm : "New position added!"});
  }
  else{
    const positions = await db.position_data.findAll({
      where: {
        election_id: eid
      }
      ,include: ['election']
      
    });
    const election_title = await db.election_data.findOne({
      where: {
        election_id: eid
      }
      
    });
    res.render('./election_admin/positions/reg2',{eid,positions,election_title,alertsm : "Position already Exists!"});
  }


}







//update  position



const update_position_get =  async function(req,res)
{
  
  var pid1=req.params.pid;
  var eid1=req.params.eid;
  res.render('./election_admin/positions/update',{eid1,pid1,alertsm : ""});
  
}



//update sql
const update_position = async function(req,res)
{

    

  try

{
  const test = await db.position_data.update(
    {
      position_name: req.body.position_name 
    },
    {
      where: { position_id: req.body.position_id }
    });



    const positions = await db.position_data.findAll({
      where: {
        election_id: req.body.election_id
      },include: ['election']
      
    });

      res.render('./election_admin/positions/manage',{positions,alertsm : "Position updated Successfully"});




  }catch(err){console.log(err);}

}




    module.exports= { positions_register_get2,save,positions_register_get,manage,delete_position,update_position_get,update_position}
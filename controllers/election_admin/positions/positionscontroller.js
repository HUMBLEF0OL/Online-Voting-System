const express = require("express");
const db = require('../../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash'); 

const positions_register_get =  async function(req,res)
{

  const elections = await db.election_data.findAll({
    where: {
      status: "not_started"
    },
    order:  [['election_id', 'DESC']]

  });
  res.render('./election_admin/positions/reg1',{elections,alertsm : ""});
  
}

const positions_register_get2 =  async function(req,res)
{
  
  var eid=req.params.eid;
  res.render('./election_admin/positions/reg2',{eid,alertsm : ""});
  
}



//positions manager
const manage = async function(req,res)
{

    
  var eid=req.params.eid;

  const positions = await db.position_data.findAll({
    where: {
      election_id: eid
    }
    ,include: ['election']
    
  });
 
    
  //res.send(positions);
   res.render('./election_admin/positions/manage',{positions,alertsm : ""});
  
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

  var params = req.body
  
  console.log(params);
  
  //saving election data to database
  db.position_data.create(params).catch(function(err){
    console.log(err)
    });
 


 //save positions to database   
    const elections = await db.election_data.findAll({
      where: {
        status: "not_started"
      },
      order:  [['election_id', 'DESC']]
  
    });
    res.render('./election_admin/positions/reg1',{elections,alertsm : "Election Position has been registered successfully"});
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
const express = require("express");
const db = require('../../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash'); 

const manage_get =  async function(req,res)
{

  const elections = await db.election_data.findAll({
    where: {
      status: ["not_started","running"],
    },
    order:  [['election_id', 'DESC']]

  });
  res.render('./election_admin/voter/manageV',{elections,alertsm : ""});
  
}
// for viewing the voters of a particular election
// const view =  async function(req,res)
// {
  
//    var eid=req.params.eid;
//   try {

    // const voter_rolls = await db.voter_roll.findAll({
    //   where: {
    //     election_id: eid
    //   },
    //   order:  [['roll_id', 'ASC']]
  
    // });
 
//       res.render('./election_admin/voter_roll/view',{voter_rolls,eid,alerte:"",alertsm : ""});

//   } catch (error) 
//   {
  
//      console.log(error);
//   }
  
// }
const view =  async function(req,res)
{
  
   var eid=req.params.eid;
   try {

    const election = await db.election_data.findOne({
      where: {
        election_id: eid,
        status: ["not_started","running"],
      }
    
    });
    const stats = await db.roll_data.findAll({
      where: {
        election_id: eid
      },
      order:  [['roll_id', 'ASC']]
  
    });
    const voter_rolls = await db.roll_data.findAll({
      where: {
        election_id: eid
      },
      include :
      {
        model: db.user_data, as: 'user_info',
        // model: db.election_data, as: 'election',
      },
      order:  [['roll_id', 'ASC']]
  
    });
 
      res.render('./election_admin/voter/view',{voter_rolls,eid,election,stats,alerte:"",alertsm : ""});

  } catch (error) 
  {
  
     console.log(error);
  }
  
}


//voter manager


const manage = async function(req,res)
{

  var eid=req.params.eid;

  const voter_rolls = await db.roll_data.findAll({
    where: {
      election_id: eid,
    },
    include :
    {
      model: db.user_data, as: 'user_info',
      // model: db.election_data, as: 'election',
    },
    order:  [['roll_id', 'ASC']]

  });
  
 
    
  //res.send(positions);
   res.render('./election_admin/voter/manage2V',{voter_rolls,eid,alertsm : ""});
  
}



const disqualify_voter_get =  async function(req,res)
{
  

  var rid=req.params.rid;
  try {

    const voter_rolls = await db.roll_data.findAll({
      where: {
        roll_id : rid
      },
      order:  [['roll_id', 'ASC']]
  
    });
    

   

    
 
      res.render('./election_admin/voter/reason',{voter_rolls,rid,alerte:"",alertsm : ""});
        //res.send(positions);

  } catch (error) 
  {
  
     console.log(error);
  }

}






const disqualify_voter= async function(req,res)
{

  try
    
  {
    var rid= req.body.roll_id;
   
    const reason = req.body.reason;
     await db.roll_data.update(
      {
        status:'disqualified',
        reason:reason
      },
      {
        where: { roll_id:rid }
      });
  
      const voter = await db.roll_data.findOne({
        where: {
          roll_id : rid
        },
        order:  [['roll_id', 'ASC']]
    
      });
      // deleting the record from the votes table for disqualified candidate! 
      var election = voter.election_id
      var user = voter.user_id;
      await db.votes_data.destroy({
        where:{
          election_id:election,
          user_id:user
        }
      })

      const elections = await db.election_data.findAll({
        where: {
          status: ["not_started","running"],
        },
        order:  [['election_id', 'DESC']]
    
      });
      res.render('./election_admin/voter/manageV',{elections,alertsm : "Changes Saved"});
   
  
  
    }catch(err){console.log(err);}
  }




    module.exports= { manage_get,view,manage,disqualify_voter,disqualify_voter_get}

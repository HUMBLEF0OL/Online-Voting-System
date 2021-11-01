const express = require("express");
const db = require('../../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash'); 

const manage_get =  async function(req,res)
{
  const pageAsNumber = Number.parseInt(req.params.pagen);
  let page = 0;
  let size = 5; //number of records per page
  if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
    page = pageAsNumber;
  }
  const elections = await db.election_data.findAll({
    limit: size,
    offset: page * size,
    where: {
      status: ["completed"],
    },
    order:  [[['published']],['start_date', 'DESC']]

  });
  const totalElection = await db.election_data.count({
    
    where: {
      status: ["completed"],
    },
  });
  const totalPages =  Math.ceil(totalElection/ Number.parseInt(size));


  
  res.render('./election_admin/results/manageR',{elections,totalPages,page,alertsm : ""});
  
}


const publish_election = async function(req,res)
{
    var eid=req.params.eid;
    
    try
    {
    await db.election_data.update(
      {
        published: 'yes' 
      },
      {
        where: { election_id: eid }
      });

      const elections = await db.election_data.findAll({
        where: {
          status: ["completed"],
        },
        order:  [[['published']],['start_date', 'DESC']]
    
      });
      res.render('../views/election_admin/results/manageR',{elections,alertsm : "Election Results Has been Published"});

    }catch(err){console.log(err)}
     
   
  }


//dashboard view

const election_dashboard_view = async  function(req,res)
{
  var eid=req.params.eid;
  var election_stats={};

  
  try
  {
  const elections = await db.election_data.findOne({where:{election_id:eid}});
  election_stats.positions = await db.position_data.count({where:{election_id:eid}});
  election_stats.candidates = await db.candidate_data.count({where:{election_id:eid}});
  election_stats.voters_eligible = await db.roll_data.count({where:{election_id:eid,status:"eligible"}});
  election_stats.voters_registered = await db.roll_data.count({where:{election_id:eid}});

                          //Results set Controls    
                          if (elections.status=='completed')
                          {

                                        const results = await db.position_data.findAll({
                                          where: {
                                            election_id: eid
                                          },
                                          include :
                                          {
                                            model: db.results_data, as: 'results',
                                            include : { 
                                              model: db.candidate_data, as: 'candidate', include:{ model: db.user_data , as:'user_info' }
                                            }, order:  [['candidate_votes', 'DESC']]
                                          },
                                          order:  [['position_name', 'ASC']]
                                        });
                                        res.render('../views/election_admin/results/viewR',{election_stats,elections,results});           
                                       
                          }
                          else
                          {
                                        const results = await db.position_data.findAll({
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
                                       // res.send(results);
                                       res.render('../views/election_admin/results/viewR',{election_stats,elections,results}); 

                          }





//res.render('../views/election_admin/elections/dashboard_view',{election_stats,elections,results});  
}
  catch(err){console.log(err);}

}





const exportResult = async  function(req,res)
{
  var eid=req.params.eid;
  var election_stats={};

  
  try
  {
  const elections = await db.election_data.findOne({where:{election_id:eid}});
  election_stats.positions = await db.position_data.count({where:{election_id:eid}});
  election_stats.candidates = await db.candidate_data.count({where:{election_id:eid}});
  election_stats.voters_eligible = await db.roll_data.count({where:{election_id:eid,status:"eligible"}});
  election_stats.voters_registered = await db.roll_data.count({where:{election_id:eid}});

    //Results set Controls    
    if (elections.status=='completed')
    {

                  const results = await db.position_data.findAll({
                    where: {
                      election_id: eid
                    },
                    include :
                    {
                      model: db.results_data, as: 'results',
                      include : { 
                        model: db.candidate_data, as: 'candidate', include:{ model: db.user_data , as:'user_info' }
                      }, order:  [['candidate_votes', 'DESC']]
                    },
                    order:  [['position_name', 'ASC']]
                  });
                  res.render('../views/election_admin/results/export',{election_stats,elections,results});           
                  
    }
    else
    {
                  const results = await db.position_data.findAll({
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
                  // res.send(results);
                  res.render('../views/election_admin/results/export',{election_stats,elections,results}); 

    }





//res.render('../views/election_admin/elections/dashboard_view',{election_stats,elections,results});  
}
  catch(err){console.log(err);}

}


    module.exports= { manage_get,publish_election,election_dashboard_view,exportResult}

const express = require('express');
const db = require('../../models');
const fast2sms = require('fast-two-sms');
const _ = require('lodash');
const passport = require('passport');
const session = require('express-session');
const fs = require('fs');
const { sequelize } = require('../../models');
const { doesNotMatch } = require('assert');
const { nthArg } = require('lodash');
const { url } = require('inspector');

//Function to Authenticate User -> user must be voter otherwise it can't access the voter module
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated())
    {
        req.user.then(function(result) {
          // console.log(result.role) // "Some User token"
          if(result.role!='voter')
            {
                res.redirect('/');
            }  
            else
            {
                return next();
            }
        });            
    }
    else
    {
        res.redirect('/');
    }

}

//Function to get the dashboard view for voter module
const voter_dashboard_get = async  function(req,res)
{
    var election_stats={};
    const elections = await db.election_data.findAll({
        limit: 5,
        order: [[
            'start_date','DESC'
        ]]
    });

    let hasVoted = [];
    const userID = await req.user.then(result => result.user_id);

    //   console.log(elections[0].election_id + " " + userID);
    for(let i = 0;i < elections.length; i++)
    {
        const check = await db.votes_data.findOne({
            where : {
                election_id : elections[i].election_id,
                user_id : userID
            }
        });
        hasVoted[i] = new Object();
        hasVoted[i]['election_id'] = elections[i].election_id;

        if(check !== null)
        {
            hasVoted[i]['hasVoted'] = true;
        }
        else
        {
            hasVoted[i]['hasVoted'] = false;
        }
    }

    election_stats.election_count = await db.election_data.count();
    election_stats.election_scheduled = await db.election_data.count({
        where : {
        status:'not_started'
        }
    });
    
    election_stats.election_running = await db.election_data.count({
        where : {
        status:'running'
        }
    });

    election_stats.election_completed = await db.election_data.count({
        where : {
        status:'completed'
        }
    });

    let alert = null;
    if(!_.isEmpty(req.query.alert))
        alert = req.query.alert;
    res.render('../views/voter/dashboard',{election_stats,elections,hasVoted,alert});
};

 

//Function to get the data of candidates for Election with id (elecid)
const getCandData = async function(elecid) {

    let candidateData = await db.candidate_data.findAll({
        where: {election_id:elecid},
        attributes:['position_id','user_id','status','candidate_id'],
    });

    let positionData = await db.position_data.findAll({
        where: {
            election_id: elecid
        },
        attributes: [
            'position_name',
            'position_id'
        ]
    });

    let userData = await db.user_data.findAll({
        attribute:[
            'user_id',
            'firstname',
            'lastname',
            'email',
            'phonenumber'
        ]
    });        
    
    let dataToDisplay = [];
    for(let i = 0; i < candidateData.length; i++)
    {
        let posID = candidateData[i].position_id;
        let userID = candidateData[i].user_id;
        let canStatus = candidateData[i].status;
        let canID = candidateData[i].candidate_id;
        let posName = null;
        let canfName = null;
        let canlName = null;
        let eID = null;
        let phNo = null;
        for(let j = 0; j < positionData.length; j++)
        {
            if(positionData[j].position_id === posID)
            {
                posName = positionData[j].position_name;
                break;
            }
        }
        for(let j = 0;j < userData.length; j++)
        {
            if(userData[j].user_id === userID)
            {
                canfName = userData[j].firstname;
                canlName = userData[j].lastname;
                eID = userData[j].email;
                phNo = userData[j].phonenumber;
            }
        }
        dataToDisplay[i] = new Object();
        dataToDisplay[i]['position_id'] = posID;
        dataToDisplay[i]['user_id'] = userID;
        dataToDisplay[i]['status'] = canStatus;
        dataToDisplay[i]['candidate_id'] = canID;
        dataToDisplay[i]['position_name'] = posName;
        dataToDisplay[i]['firstname'] = canfName;
        dataToDisplay[i]['lastname'] = canlName;
        dataToDisplay[i]['email'] = eID;
        dataToDisplay[i]['phonenumber'] = phNo;
    }
    dataToDisplay.sort((a,b) => {
        if(a.position_id < b.position_id)
            return -1;
        if(a.position_id > b.position_id)
            return 1;
        return 0;
    });

    return dataToDisplay;
}

//For viewing the information of election, which has not yet started, from dashboard
const viewCandidates = async function (req,res) {
    const elecid = req.params.eid;
    try
    {
        //Collecting data for candidates for Election with election id (elecid)
        let dataToDisplay = await getCandData(elecid);

        //Getting the data of Election with election id (elecid)        
        let electionData = await db.election_data.findOne({
            where:{
                election_id: elecid
            }
        });

        //Rendering the page with Election and Candidate Info for Election with election id (elecid)
        res.render('./voter/viewCandidates',{dataToDisplay,electionData});       
    }
    catch(err)
    {
        console.log(err);
    }
};

const electionList = async (req,res) => {
    
    try
    {

        const pageAsNumber = Number.parseInt(req.params.pn);
        let page = 0;
        let size = 20; //number of records per page
        if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
            page = pageAsNumber;
        }

        //Retrieving the current Not started Elections
        const currElecList = await db.election_data.findAll({
            limit: size,
            offset: page * size,
            where: { status: 'not_started'}
        });

        const totalElection = await db.election_data.count({
            where: {
                status: 'not_started'
            }
        });

        //Generating array for whether user has registered or not
        let nAlreadyRegistered = [];

        //function which runs for each election
        let process = async function(election){
            const check = await db.roll_data.findAll({
                where:
                {
                    user_id : await req.user.then(result => result.user_id),
                    election_id : election.election_id
                }
            });
            let result = Object.keys(check).length === 0;
            nAlreadyRegistered.push(result);
        };

        //for loop for checking every election for user register
        for(const election of currElecList)
        {
            await process(election);
        }
       
        //rendering the Register page
        let alertmsg = null;
        if(!_.isEmpty(req.query.alert))
            alertmsg = req.query.alert;
        
        const totalPages =  Math.ceil(totalElection/ Number.parseInt(size));

        res.render('./voter/viewCurrentElections',{currElecList,alertmsg,nAlreadyRegistered,totalPages,page});
    }
    catch(err)
    {
        console.log(err);
    }
};

const registerForElection = async (req,res) => {

    //Creating params object with user_id and election_id
    const params = await req.user.then(function(result){
        let params = req.body;
        params.user_id = result.user_id;
        params.election_id = req.params.uid;
        return params;                     
    });  
    
    //checking whether user already registered or not
    const check = await db.roll_data.findAll({
        where :{
            election_id : req.params.uid,
            user_id : params.user_id
        }
    });

    const electionName = await db.election_data.findOne({
        where: {
            election_id: params.election_id
        },
        attribute: [
            'title'
        ]
    });

    //Checking whether user alerady registered for uid election or not
    if(Object.keys(check).length === 0){
        await db.roll_data.create(params).catch( err => console.log(err));
    }

    let alertmsg = "You have Successfully registered for " + electionName.title; 
    alertmsg = encodeURIComponent(alertmsg);   

    //redirect to Register page to avoid knowing register address
    res.redirect('/voter/viewCurrElections/?alert=' + alertmsg);
    
};

const electionInfo = async(req,res) => {
   try{

    const pageAsNumber = Number.parseInt(req.params.pn);
    let page = 0;
    let size = 5; //number of records per page
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
        page = pageAsNumber;
    }

    //Getting the data of elections from database
    const electionData = await db.election_data.findAll({
        limit: size,
        offset: page * size
    });

    const totalElection = await db.election_data.count({});

    //Sorting the elections on based on UpdatedAt
    electionData.sort((a,b) => {
        if(a.updatedAt > b.updatedAt)
            return -1;
        if(a.updatedAt < b.updatedAt)
            return 1;
        return 0;
    });

    const totalPages =  Math.ceil(totalElection/ Number.parseInt(size));

    // console.log(electionData);

    res.render('./voter/viewElections',{electionData,totalPages,page});
   }
   catch(err){
       console.log(err);
   }
};

const voteManager = async (req,res) => {
    const eid = req.params.eid;
    // const uid = req.user.user_id;
    try
    {
        const userID = await req.user.then(result => result.user_id);
        const check = await db.roll_data.findOne({
            where :{
                election_id : eid,
                user_id : userID,
                status : 'eligible'
            }
        });

        if(check != null)
        {
            const dataToDisplay = await getCandData(eid);

            const electionData = await db.election_data.findOne({
                where : {
                    election_id : eid
                }
            });

            res.render('./voter/votingManager',{dataToDisplay,electionData});
        }
        else
        {
            const electionData = await db.election_data.findOne({
                where: {
                    election_id : eid
                },
                attribute : [
                    'title'
                ]
            });

            let alertmsg = "You have not registered for " + electionData.title;
            alertmsg = encodeURIComponent(alertmsg);
            res.redirect('/voter/dashboard/?alert=' + alertmsg);
        }      
    }
    catch(err)
    {
        console.log(err);
    }
};


const voteDataHandler = async(req,res) => {

    const eid = req.body.election_id;
    const userID = await req.user.then(result => result.user_id);
    const positionIDs = await db.position_data.findAll({
        where: {
            election_id :eid
        },
        attribute : [
            'position_id',
            'position_name'
        ]
    });

    var otp_pin =Math.floor(100000 + Math.random() * 900000);
    var expiry_otp_time = new Date();
    expiry_otp_time.setMinutes( expiry_otp_time.getMinutes() + 20 );

    for(let i = 0;i < positionIDs.length; i++)
    {

        const params = new Object();
        params['election_id'] = parseInt(eid);
        params['candidate_id'] = parseInt(req.body[positionIDs[i].position_name]);
        if(params.candidate_id === -1)
            continue;
        params['position_id'] = positionIDs[i].position_id;
        params['user_id'] = userID;
        params['otp'] = otp_pin;
        params['otp_expiry_time'] = expiry_otp_time;
        db.votes_data.create(params).catch((err) => {
            console.log(err);
        });
      
    }

    //retrieving the user phone number
    const userPHNo = await db.user_data.findOne({
        where: {
            user_id: userID
        },
        attribute :[
            'phonenumber'
        ]
    });

    //need to test this 
    let phoneNumber = (userPHNo.phonenumber).toString();

    message = "Dear Voter ,Your One time pin in order to voting is " + otp_pin;
    var options = {authorization : 'bRVqwyt6GYT7mNQzvkFOpSnhoC09XrEM8gZKA1dielPc25sBJLoUOnWaCl68usGf23FjKwdk1mADy54N' , message : message ,  numbers : [phoneNumber]} 
    fast2sms.sendMessage(options).then(response=>{console.log(response)});
    res.render('./voter/otp_verify');
};

const verify  = async function(req,res){

    const otpEntered = req.body.otp;

    try
    {
        // get single todo by id
        const votedata = await db.votes_data.findAll({
            where: {
            otp: otpEntered
            }
        });

        // console.log(election_one);
        if (_.isEmpty(votedata))
        {
            errors= "Wrong OTP PIN Please try again";
            res.render('./voter/otp_verify');
        }
        else
        {
            const test = await db.votes_data.update(
                {
                    otp_verify: 'yes' 
                },
                {
                where: { 
                    otp: otpEntered 
                }
            });
            let alertmsg = "You have Successfully Voted";
            alertmsg = encodeURIComponent(alertmsg);
            res.redirect('/voter/dashboard/?alert=' + alertmsg);
        }
    }
    catch (err)
    {        
        console.log(err);
    }
};

const viewResult = async function(req,res)
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
            res.render('../views/voter/Result',{election_stats,elections,results});           
                    
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
            res.render('../views/voter/Result',{election_stats,elections,results}); 

        }
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports = {voter_dashboard_get,isAuthenticated,viewCandidates, viewResult, electionList, registerForElection,electionInfo , voteManager, voteDataHandler, verify};
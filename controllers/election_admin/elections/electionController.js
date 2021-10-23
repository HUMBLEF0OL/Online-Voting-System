const express = require("express");
const db = require('../../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash');

const election_register_get = function (req, res) {
  var alertsm = "";
  res.render('../views/election_admin/elections/registerelection', { alertsm });
}
//election manager
const manage = async function (req, res) {
  const elections = await db.election_data.findAll();
  res.render('../views/election_admin/elections/electionmanager', { elections, alertsm: "" });
}


//start election
const start_election = async function (req, res) {
  var eid = req.params.eid;

  try {
    await db.election_data.update(
      {
        status: 'running'
      },
      {
        where: { election_id: eid }
      });

    const elections = await db.election_data.findAll();
    res.render('../views/election_admin/elections/electionmanager', { elections, alertsm: "Election Has been Started" });

  } catch (err) { console.log(err) }


}



//stop election
const stop_election = async function (req, res) {
  try {
    var eid = req.params.eid;
    await db.election_data.update(
      {
        status: 'completed'
      },
      {
        where: { election_id: eid }
      });

    const elections = await db.election_data.findAll();



    // populating the result table
    // var eid=req.params.eid;
    // finding all the positions related to the given election
    var position = await db.position_data.findAll({
      where: {
        election_id: eid
      }
    });
    // running a loop over all the positions of current election
    for (var j = 0; j < position.length; j++) {
      // console.log("\n\n\n\n\n "+position[j].position_id+"\n\n\n\n");
      let current_position = position[j].position_id;
      // finding all the candidates for the current position
      var candidate = await db.candidate_data.findAll({
        where: {
          election_id: eid,
          position_id: current_position
        }
      });
      // running a loop over all the candidates resgistered for current position
      for (var k = 0; k < candidate.length; k++) {
        let current_candidate = candidate[k].candidate_id;
        // finding votes of current candidate
        let candidate_vote = await db.votes_data.count({
          where: {
            election_id: eid,
            position_id: current_position,
            candidate_id: current_candidate
          }
        });

        // finding total votes
        let total_votes = await db.votes_data.count({
          where: {
            election_id: eid,
            position_id: current_position,
          }
        });
        // pushing all the above calculated data into result table

        await db.results_data.create({
          total_votes: total_votes,
          candidate_votes: candidate_vote,
          position_id: current_position,
          candidate_id: current_candidate,
          election_id: eid

        });

      }
    }







    var position = await db.position_data.findAll({
      where: {
        election_id: eid
      }
    });
    // running a loop over all the positions of current election
    for (var j = 0; j < position.length; j++) {
      let current_position = position[j].position_id;

      // finding same_max and maximum votes for this election
      // finding maximum votes
      var max_votes = 0;
      let max_votes_finder = await db.results_data.findAll({
        where: {
          election_id: eid,
          position_id: current_position,
        }
      })
      for (let i = 0; i < max_votes_finder.length; i++) {
        if (max_votes < max_votes_finder[i].candidate_votes) {
          max_votes = max_votes_finder[i].candidate_votes;
        }
      }
      // finding number of candidates who have got the maximum number of votes
      var same_max = await db.results_data.findAll({
        where: {
          election_id: eid,
          position_id: current_position,
          candidate_votes: max_votes
        }
      });



      // finding all the candidates for the current position
      var candidate = await db.candidate_data.findAll({
        where: {
          election_id: eid,
          position_id: current_position
        }
      });
      // running a loop over all the candidates resgistered for current position
      for (var k = 0; k < candidate.length; k++) {
        let current_candidate = candidate[k].candidate_id;
        // finding votes of current candidate
        let candidate_data = await db.results_data.findOne({
          where: {
            election_id: eid,
            position_id: current_position,
            candidate_id: current_candidate
          }
        });
        var candidate_vote = candidate_data.candidate_votes;




        // if more then one candidate got same maximum votes then its a tie
        if (same_max.length > 1 && candidate_vote == max_votes) {
          await db.results_data.update(
            {
              result_outcome: 'tie'
            },
            {
              where: {
                election_id: eid,
                position_id: current_position,
                candidate_id: current_candidate
              }
            });
        }
        // if current_candidate votes equal to max then he is the winner
        else if (candidate_vote == max_votes) {
          await db.results_data.update(
            {
              result_outcome: 'won'
            },
            {
              where: {
                election_id: eid,
                position_id: current_position,
                candidate_id: current_candidate
              }
            });
        }
        else {
          await db.results_data.update(
            {
              result_outcome: 'lost'
            },
            {
              where: {
                election_id: eid,
                position_id: current_position,
                candidate_id: current_candidate
              }
            });
        }

      }
    }
    res.render('../views/election_admin/elections/electionmanager', { elections, alertsm: "Election Has been Completed" });

  } catch (err) { console.log(err) }






}


//publish election
const publish_election = async function (req, res) {
  var eid = req.params.eid;

  try {
    await db.election_data.update(
      {
        published: 'yes'
      },
      {
        where: { election_id: eid }
      });

    const elections = await db.election_data.findAll();
    res.render('../views/election_admin/elections/electionmanager', { elections, alertsm: "Election Results Has been Published" });

  } catch (err) { console.log(err) }


}

//delete election
const delete_election = async function (req, res) {
  var eid = req.params.eid;

  try {
    await db.election_data.destroy(
      {
        where: { election_id: eid }
      });



    const elections = await db.election_data.findAll();
    res.render('../views/election_admin/elections/electionmanager', { elections, alertsm: "Election Has been deleted" });

  } catch (err) { console.log(err) }


}

const save = function (req, res) {
  //generate a unique otp pin
  var otp_pin = Math.floor(100000 + Math.random() * 900000);

  //generate a unique election display id
  var eid = Math.floor(100000 + Math.random() * 900000);

  //generate expiry time for one time pin
  var expiry_otp_time = new Date();

  console.log(expiry_otp_time);

  expiry_otp_time.setMinutes(expiry_otp_time.getMinutes() + 20);


  var params = req.body
  // finding all the elections with the same name
  const existing_election = db.election_data.findAll({
    where: {
      title: req.body.title,
    }
  });
  console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"+existing_election.length+"\n\n\n\n\n\n\n\n"+req.body.title);

  params.otp = otp_pin
  params.election_display_id = eid
  params.otp_expiry_time = expiry_otp_time
  var start_date = new Date(req.body.start_date);
  var stop_date = new Date(req.body.stop_date);

  var pseudo = "2021-10-17T";
  var start_time = req.body.start_time;
  var stop_time = req.body.stop_time;
  var start_date_time = new Date(pseudo + start_time);
  var stop_date_time = new Date(pseudo + stop_time);

  const [h1, m1] = [start_date_time.getHours(), start_date_time.getMinutes()];
  const [h2, m2] = [stop_date_time.getHours(), stop_date_time.getMinutes()];
  // election can't be scheduled
  if (existing_election.length > 0 || stop_date - start_date < 0 || ((stop_date - start_date == 0) && ((h1 > h2) || (h1 == h2 && m1 > m2)))) {
    var message = "";
    var err1 = "";
    var err2 = "";
    var err3 = "";
    if (existing_election.length > 0) err1 = "An election with the same name already exists";
    if (stop_date - start_date < 0) err2 = "Start date must be before stop date";
    if ((stop_date - start_date == 0) && ((h1 > h2) || (h1 == h2 && m1 > m2))) err3 = "Please enter the correct time";

    message = err1.concat(err2, err3);

    res.render('../views/election_admin/elections/registerelection', { existing_election, alertsm: message });
  }
  else {

    //saving election data to database
    db.election_data.create(params).catch(function (err) {
      console.log(err)


    });
    //send otp to administrator
    message = "Dear Election Admin ,Your One time pin in order to  schedule an election is " + otp_pin;
    var options = { authorization: 'bRVqwyt6GYT7mNQzvkFOpSnhoC09XrEM8gZKA1dielPc25sBJLoUOnWaCl68usGf23FjKwdk1mADy54N', message: message, numbers: ['9773640463'] }
    fast2sms.sendMessage(options).then(response => { console.log(response) })

    res.render('../views/election_admin/elections/otp_verify');
  }





}

const verify = async function (req, res) {

  const otpf = req.body.otp;
  var check = "";
  var success = "";
  var errors = "";
  var alerts = {};

  console.log(otpf);

  try {
    // get single todo by id
    const election_one = await db.election_data.findOne({
      where: {
        otp: otpf
      }
    });


    console.log(election_one);

    if (_.isEmpty(election_one)) {
      errors = "Wrong OTP PIN Please try again";
      res.render('../views/election_admin/elections/otp_verify');
    }
    else {
      const test = await db.election_data.update(
        {
          otp_verify: 'yes'
        },
        {
          where: { otp: otpf }
        });


      success = "Election  : " + election_one.title + " with ID: " + election_one.election_display_id + " is Successfully Registered";

      alerts.success = success;

      const elections = await db.election_data.findAll();
      res.render('../views/election_admin/elections/electionmanager', { elections, alertsm: success });
    }


  }
  catch (err) {

    console.log(err);
  }

}


//authentication for Election Administratior routes
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.user.then(function (result) {
      // console.log(result.role) // "Some User token"
      if (result.role != 'e_admin') {
        res.redirect('/');
      }
      else {
        return next();
      }
    });


  }
  else {
    res.redirect('/');
  }

}


//dashboard 

const election_dashboard = async function (req, res) {

  var election_stats = {};
  const elections = await db.election_data.findAll();
  election_stats.election_count = await db.election_data.count();
  election_stats.election_scheduled = await db.election_data.count({
    where: {
      status: 'not_started'
    }
  });

  election_stats.election_running = await db.election_data.count({
    where: {
      status: 'running'
    }
  });

  election_stats.election_completed = await db.election_data.count({
    where: {
      status: 'completed'
    }
  });


  res.render('../views/election_admin/elections/dashboard', { election_stats, elections });
}

//dashboard view

const election_dashboard_view = async function (req, res) {
  var eid = req.params.eid;
  var election_stats = {};


  try {
    const elections = await db.election_data.findOne({ where: { election_id: eid } });
    election_stats.positions = await db.position_data.count({ where: { election_id: eid } });
    election_stats.candidates = await db.candidate_data.count({ where: { election_id: eid } });
    election_stats.voters_eligible = await db.user_data.count();
    election_stats.voters_registered = await db.roll_data.count({ where: { election_id: eid } });

    //Results set Controls    
    if (elections.status == 'completed') {

      const results = await db.position_data.findAll({
        where: {
          election_id: eid
        },
        include:
        {
          model: db.results_data, as: 'results',
          include: {
            model: db.candidate_data, as: 'candidate', include: { model: db.user_data, as: 'user_info' }
          }, order: [['candidate_votes', 'DESC']]
        },
        order: [['position_name', 'ASC']]
      });
      res.render('../views/election_admin/elections/dashboard_view', { election_stats, elections, results });

    }
    else {
      const results = await db.position_data.findAll({
        where: {
          election_id: eid
        },
        include:
        {
          model: db.candidate_data, as: 'candidate',
          include: {
            model: db.user_data, as: 'user_info'
          }
        },
        order: [['position_name', 'ASC']]
      });
      // res.send(results);
      res.render('../views/election_admin/elections/dashboard_view', { election_stats, elections, results });

    }





    //res.render('../views/election_admin/elections/dashboard_view',{election_stats,elections,results});  
  }
  catch (err) { console.log(err); }

}




module.exports = { election_dashboard_view, election_dashboard, verify, save, election_register_get, manage, start_election, delete_election, publish_election, stop_election, isAuthenticated }

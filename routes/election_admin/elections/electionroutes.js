
const express = require('express')
const router = require('express').Router()

const electioncontroller = require('../../../controllers/election_admin/elections/electionController');

router.get('/eregister',electioncontroller.isAuthenticated,electioncontroller.election_register_get);   

//adding data to the database
router.post('/save',electioncontroller.isAuthenticated,electioncontroller.save);
  
//otp verify
router.post('/registration-verify',electioncontroller.isAuthenticated,electioncontroller.verify);

//start election
 router.get('/start/:eid',electioncontroller.isAuthenticated,electioncontroller.start_election);

// stop election
//manage election
router.get('/manage',electioncontroller.isAuthenticated,electioncontroller.manage);

//delete election
router.get('/delete/:eid',electioncontroller.isAuthenticated,electioncontroller.delete_election);


//publish election
router.get('/publish/:eid',electioncontroller.isAuthenticated,electioncontroller.publish_election);


//delete election
router.get('/stop/:eid',electioncontroller.isAuthenticated,electioncontroller.stop_election);

//Election Dashboard 

router.get('/dashboard',electioncontroller.isAuthenticated,electioncontroller.election_dashboard);  


//Election Specific  Dashboard

router.get('/dashboard/:eid',electioncontroller.isAuthenticated,electioncontroller.election_dashboard_view);  
router.get('/viewelection/:eid',electioncontroller.isAuthenticated,electioncontroller.election_dashboard_view);  


router.get('/eview/:eid',electioncontroller.isAuthenticated,electioncontroller.election_dashboard_view); 

 module.exports  = router



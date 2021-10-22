
const express = require('express')
const router = require('express').Router()

const result_controller = require('../../../controllers/election_admin/results/results_controller');

router.get('/manageR',result_controller.manage_get);   


//publish election
router.get('/publish/:eid',result_controller.publish_election);

router.get('/viewR/:eid',result_controller.election_dashboard_view); 
// router.get('/view/:eid',votercontroller.view);   

// router.get('/manage2V/:eid',votercontroller.manage);


// disqualify
// router.get('/reason/:rid',votercontroller.disqualify_voter_get);
// router.post('/reason_save',votercontroller.disqualify_voter);


 module.exports  = router



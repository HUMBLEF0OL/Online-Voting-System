
const express = require('express')
const router = require('express').Router()

const candidatescontroller = require('../../../controllers/election_admin/candidates/candidatecontroller');
const {isAuthenticated} = require('../../../controllers/election_admin/elections/electionController');

router.get('/cregister/:pagen',isAuthenticated,candidatescontroller.candidate_register_get);  


router.get('/register2/:eid',isAuthenticated,candidatescontroller.candidate_register_get2);   


router.post('/save',isAuthenticated,candidatescontroller.save_candidate);

router.get('/manage/:eid/:pagen',isAuthenticated,candidatescontroller.manage);


router.get('/manage2/:pid/:eid/:pagen',isAuthenticated,candidatescontroller.manage2);


router.get('/delete/:cid/:pid',isAuthenticated,candidatescontroller.delete_candidate);


router.get('/update/:cid/:uid/:eid/',isAuthenticated,candidatescontroller.update_candidate_get);

router.get('/disqualify/:cid/:uid/:eid/',isAuthenticated,candidatescontroller.disqualify_candidate);

router.post('/saveupdate',isAuthenticated,candidatescontroller.update_candidate);


router.get('/view/:eid',isAuthenticated,candidatescontroller.view_all);

 module.exports  = router



const express = require('express');
const router = require('express').Router();
const flash = require('connect-flash');
const session = require('express-session');
const voterController = require('../../controllers/voter/voterController.js');

router.get('/dashboard',voterController.isAuthenticated,voterController.voter_dashboard_get);

router.get('/eview/:eid',voterController.isAuthenticated,voterController.viewCandidates);

router.get('/evote/:eid',voterController.isAuthenticated,voterController.voteManager);

router.get('/eresult/:eid',voterController.isAuthenticated,voterController.viewResult);

router.get('/viewCurrElections/:pn',voterController.isAuthenticated,voterController.electionList);

router.get('/einformation/:pn',voterController.isAuthenticated,voterController.electionInfo);

router.get('/cregister/:uid', voterController.isAuthenticated,voterController.registerForElection);

router.post('/evote/voteData',voterController.voteDataHandler);

router.post('/voteVerify',voterController.isAuthenticated,voterController.verify);

module.exports = router;

const express = require('express')
const router = require('express').Router()

const positionscontroller = require('../../../controllers/election_admin/positions/positionscontroller');
const { isAuthenticated } = require('../../../controllers/election_admin/elections/electionController');

router.get('/pregister', isAuthenticated, positionscontroller.positions_register_get);

router.get('/register2/:eid', isAuthenticated, positionscontroller.positions_register_get2);


//adding data to the database
router.post('/save/:eid', isAuthenticated, positionscontroller.save);



//manage election
router.get('/manage/:eid', isAuthenticated, positionscontroller.manage);

//delete
router.get('/delete/:pid/:eid', isAuthenticated, positionscontroller.delete_position);


//update
router.get('/updateget/:pid/:eid', isAuthenticated, positionscontroller.update_position_get);
router.post('/updatefinal', isAuthenticated, positionscontroller.update_position);


module.exports = router



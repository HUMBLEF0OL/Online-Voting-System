
const express = require('express')
const router = require('express').Router()
const flash = require('connect-flash');
const session = require('express-session');
const sysadmincontroller = require('../../controllers/system_admin/sysadmincontroller');


router.get('/uregister',sysadmincontroller.isAuthenticated,sysadmincontroller.user_register_get);   

router.get('/changepassword',sysadmincontroller.isAuthenticated_role,sysadmincontroller.user_change_password_get); 

router.post('/changepassword',sysadmincontroller.isAuthenticated_role,sysadmincontroller.user_change_password); 

router.get('/udashboard',sysadmincontroller.isAuthenticated,sysadmincontroller.user_dashboard_get);  

router.get('/rolerouter',sysadmincontroller.isAuthenticated_role,sysadmincontroller.user_router);   

router.post('/save',sysadmincontroller.isAuthenticated,sysadmincontroller.save);   

router.get('/umanage',sysadmincontroller.isAuthenticated,sysadmincontroller.manage);   

router.get('/udelete/:uid',sysadmincontroller.isAuthenticated,sysadmincontroller.delete_user); 

router.get('/uupdate1/:uid',sysadmincontroller.isAuthenticated,sysadmincontroller.update_user1); 

router.post('/uupdate2',sysadmincontroller.isAuthenticated,sysadmincontroller.update_user2); 

router.post('/login',sysadmincontroller.login_handler); 

router.get('/logout',sysadmincontroller.isAuthenticated,sysadmincontroller.logout_handler); 

 module.exports  = router



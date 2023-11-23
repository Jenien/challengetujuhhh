const router = require('express').Router();
const { register, activateAccount} = require('../controllers/auth.controllers');
router.post('/register', register);
router.post('/activate-account', activateAccount);

module.exports = router;

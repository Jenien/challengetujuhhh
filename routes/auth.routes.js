const router = require('express').Router();
const { register, login, activate, forgotPassword, resetPassword } = require('../controllers/auth.controllers');

router.get('/index', (req, res) => {
    res.render('index');
});
router.post('/register', register);
router.get('/register', (req, res) => {
        res.render('register');
    });
router.post('/login', login);
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/email-activation', (req, res) => {
    let { token } = req.query;
    res.render('email-activation', { token });
});

router.post('/email-activation', activate);

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});
router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword ,(req, res) => {
let { token } = req.query;
    res.render('reset-password-page', { token });
});
router.get('/reset-password', (req, res) => {
    let { token } = req.query;
    res.render('reset-password-page', { token });
});

module.exports = router;

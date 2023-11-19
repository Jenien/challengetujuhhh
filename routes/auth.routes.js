const router = require('express').Router();
const { register, login, whoami, activate, forgotPassword, resetPassword, showResetPasswordPage } = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

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
router.get('/whoami', restrict, whoami);

// Render halaman aktivasi
router.get('/email-activation', (req, res) => {
    let { token } = req.query;
    res.render('email-activation', { token });
});

// Update user.is_verified
router.post('/email-activation', activate);

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});
// Lupa password - kirim email reset password
router.post('/forgot-password', forgotPassword);

// Tampilkan halaman reset password
router.get('/reset-password/:token', showResetPasswordPage);

router.post('/reset-password', resetPassword ,(req, res) => {
let { token } = req.query;
    res.render('reset-password-page', { token });
});
router.get('/reset-password', (req, res) => {
    let { token } = req.query;
    res.render('reset-password-page', { token });
});

module.exports = router;

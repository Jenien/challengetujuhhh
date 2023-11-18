const router = require('express').Router();
const { register, login, whoami, activate, forgotPassword, resetPassword, showResetPasswordPage } = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.post('/register', register);
router.post('/login', login);
router.get('/whoami', restrict, whoami);

// Render halaman aktivasi
router.get('/email-activation', (req, res) => {
    let { token } = req.query;
    res.render('email-activation', { token });
});

// Update user.is_verified
router.post('/email-activation', activate);

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

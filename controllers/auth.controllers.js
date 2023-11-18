const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../utils/nodemailer');
const { JWT_SECRET_KEY } = process.env;
// const generateResetPasswordToken = (email) => {
//   return jwt.sign({ email }, JWT_SECRET_KEY, { expiresIn: '1h' });
// };

module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password, password_confirmation } = req.body;
            if (password != password_confirmation) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'please ensure that the password and password confirmation match!',
                    data: null
                });
            }

            let userExist = await prisma.user.findUnique({ where: { email } });

            if (userExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'user has already been used!',
                    data: null
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            let user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword
                }
            });

            // kirim email
            let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
            let url = `http://localhost:3000/api/v1/auth/email-activation?token=${token}`;

            const html = await nodemailer.getHtml('activation-email.ejs', { name, url });
            nodemailer.sendEmail(email, 'Email Activation', html);

            return res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: { user }
            });
        } catch (err) {
            next(err);
        }
    },

    login: async (req, res, next) => {
        try {
            let { email, password } = req.body;

            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid email or password!',
                    data: null
                });
            }

            let isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid email or password!',
                    data: null
                });
            }

            let token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);

            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: { user, token }
            });
        } catch (err) {
            next(err);

        }
    },

    whoami: (req, res, next) => {
        return res.status(200).json({
            status: true,
            message: 'OK',
            err: null,
            data: { user: req.user }
        });
    },

    activate: (req, res) => {
        let { token } = req.query;

        jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad request',
                    err: err.message,
                    data: null
                });
            }

            let updated = await prisma.user.update({
                where: { email: decoded.email },
                data: { is_verified: true }
            });

            res.json({ status: true, message: 'OK', err: null, data: updated });
        });
    },
    // Forgot Password
    forgotPassword: async (req, res, next) => {
      try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
    
        if (!user) {
          return res.status(404).json({
            status: false,
            message: 'User not found',
            err: null,
            data: null
          });
        }
    
        // Buat token untuk reset password
        const token = jwt.sign({ email: user.email }, JWT_SECRET_KEY, { expiresIn: '1h' });
    
        // Kirim email dengan link untuk reset password
        const resetPasswordLink = `http://localhost:3000/api/v1/auth/reset-password?token=${token}`;
        const html = await nodemailer.getHtml('reset-password-email.ejs', { resetPasswordLink });
        await nodemailer.sendEmail(email, 'Reset Password', html);
    
        return res.status(200).json({
          status: true,
          message: 'Reset password link sent successfully',
          err: null,
          data: null
        });
      } catch (err) {
        next(err);
      }
    },
// Menampilkan halaman reset password
showResetPasswordPage: (req, res) => {
  const { token } = req.params;
  res.render('reset-password-page', { token });
},

// Reset Password
resetPassword: async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const token = req.query.token;
    console.log('token=',token);
    console.log('pass=',newPassword);
    if (!token || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Token or new password is missing',
        err: null,
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const { email } = decoded;

    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    // Gunakan `update` dengan `where` yang sesuai dengan email
    await prisma.user.update({
      where: {
        email: email, // pastikan ini adalah nama kolom di tabel
      },
      data: {
        password: encryptedPassword,
      },
    });

    return res.status(200).json({
      status: true,
      message: 'Password reset successfully',
      err: null,
      data: null
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      message: 'Error resetting password',
      err: err.message,
      data: null
    });
  }
}

};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../utils/nodemailer');
const { JWT_SECRET_KEY } = process.env;
const socketHandler = require('../handler/socketHandler');

module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password, password_confirmation } = req.body;
            if (password != password_confirmation) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'password tidak sama, cek lagi ',
                    data: null
                });
            }

            let userExist = await prisma.user.findUnique({ where: { email } });

            if (userExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Email user sudah digunakan',
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

  
              let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
              let url = `http://localhost:3000/api/v1/auth/email-activation?token=${token}`;

              const html = await nodemailer.getHtml('activation-email.ejs', { name, url });
              nodemailer.sendEmail(email, 'Email Activation', html);
              
              const notificationData = {
                type: 'registration',
                message: 'Selamat, akun baru sudah dibuat. Silahkan cek email untuk Veripikasi !!!!',
              };
        
              socketHandler.emitNotification(notificationData);

              res.json({
                status: true,
                message: 'Akun berhasil dibuat',
                err: null,
                data: { user },
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
            
            const notificationData = {
              type: 'login',
              message: 'Selamat, berhasil login',
            };
      
            socketHandler.emitNotification(notificationData);
      
            return res.status(200).json({
              status: true,
              message: 'Sukses login akun ',
              err: null,
              data: { user, token },
            });
        } catch (err) {
            next(err);

        }
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
            const notificationData = {
              type: 'activate',
              message: 'Selamat, akun baru sudah di activasi, silahkan login !!!!',
            };
      
            socketHandler.emitNotification(notificationData);

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
    
        const token = jwt.sign({ email: user.email }, JWT_SECRET_KEY, { expiresIn: '1h' });
    
        const resetPasswordLink = `http://localhost:3000/api/v1/auth/reset-password?token=${token}`;
        const html = await nodemailer.getHtml('reset-password-email.ejs', { resetPasswordLink });
        await nodemailer.sendEmail(email, 'Reset Password', html);
       
        const notificationData = {
          type: 'forgotPassword',
          message: 'Password reset link sudah terkirim ke email, silahkan di cek',
        };
  
        socketHandler.emitNotification(notificationData);
  
        return res.status(200).json({
          status: true,
          message: 'Password reset link sudah terkirim ke email, silahkan di cek',
          err: null,
          data: null,
        });
      } catch (err) {
        next(err);
      }
    },

    resetPassword: async (req, res, next) => {
      try {
        const { newPassword } = req.body;
        const token = req.query.token;
        console.log('token :',token);
        console.log('pass baru : ', newPassword);
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

        
        await prisma.user.update({
          where: {
            email: email,
          },
          data: {
            password: encryptedPassword,
          },
        });
        const notificationData = {
          type: 'resetPassword',
          message: 'Password reset berhasil, silahkan login dengan password baru.',
        };
  
        socketHandler.emitNotification(notificationData);

        return res.status(200).json({
          status: true,
          message: 'Password berhasil di update, silahkan login dengan password baru.',
          err: null,
          data: null,
        });
      } catch (err) {
        return res.status(400).json({
          status: false,
          message: 'Error updating password',
          err: err.message,
          data: null
        });
      }
    }

    };
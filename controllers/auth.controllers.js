const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpHandler = require('../handler/otpHandler');
const nodemailer = require('../utils/nodemailer');
const { JWT_SECRET_KEY } = process.env;
const socketHandler = require('../handler/socketHandler');

module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password, password_confirmation } = req.body;
            if (password !== password_confirmation) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Passwords do not match',
                    data: null
                });
            }

            let userExist = await prisma.user.findUnique({ where: { email } });

            if (userExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Email is already in use',
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

            const otp = await otpHandler.generateOTP(email);
            const html = `Your OTP for account activation is: <strong>${otp}</strong>`;
            await nodemailer.sendEmail(email, 'Account Activation OTP', html);

            const notificationData = {
                type: 'registration',
                message: 'Congratulations, your account has been created. Please check your email for OTP!',
            };

            socketHandler.emitNotification(notificationData);

            res.json({
                status: true,
                message: 'Account created successfully',
                err: null,
                data: { user},
            });
        } catch (err) {
            next(err);
        }
    },

    activateAccount: async (req, res) => {
      try {
          const { token } = req.query;
  
          jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
              if (err) {
                  return res.status(400).json({
                      status: false,
                      message: 'Bad request',
                      err: err.message,
                      data: null
                  });
              }
  
              const { email } = decoded;
              const otp = req.body.otp; // Ambil OTP dari body request
  
              const storedOTP = await otpHandler.getOTPFromStorage(email);
  
              if (otp !== storedOTP) {
                  return res.status(400).json({
                      status: false,
                      message: 'Bad request',
                      err: 'Invalid OTP',
                      data: null
                  });
              }
  
              // let updated = await prisma.user.update({
              //     where: { email },
              //     data: { is_verified: true }
              // });
  
              const notificationData = {
                  type: 'activate',
                  message: 'Congratulations, your account has been activated! You can now login.',
              };
  
              socketHandler.emitNotification(notificationData);
  
              res.json({ status: true, message: 'Account activated successfully', err: null, data: updated });
          });
      } catch (err) {
          return res.status(500).json({
              status: false,
              message: 'Error activating account',
              err: err.message,
              data: null
          });
      }
  }
};
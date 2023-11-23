const generateOTP = require('otp-generator');
const otpStorage = {}; // Mekanisme penyimpanan OTP Anda (contoh: objek, database, dll.)

module.exports = {
    generateOTP: async (email) => {
        const otp = generateOTP.generate(6, { upperCase: false, specialChars: false, alphabets: false });
        otpStorage[email] = otp; // Menyimpan OTP ke penyimpanan yang terkait dengan email pengguna

        return otp;
    },

    getOTPFromStorage: async (email) => {
        return otpStorage[email] || null; // Mengambil OTP dari penyimpanan yang terkait dengan email pengguna
    }
};

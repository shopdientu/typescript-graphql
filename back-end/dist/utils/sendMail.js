"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = async (to, html) => {
    let transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'shopdientu.tk@gmail.com',
            pass: 'Toikhongbiet!2',
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    let info = await transporter.sendMail({
        from: 'tu toi',
        to,
        subject: 'Hello ✔',
        text: 'Hello world?',
        html,
    });
    console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
};
exports.sendMail = sendMail;
//# sourceMappingURL=sendMail.js.map
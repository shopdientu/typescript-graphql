import nodemailer from 'nodemailer'

// async..await is not allowed in global scope, must use a wrapper
export const sendMail = async (to: string, html: string) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount()
  // console.log(testAccount)
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', //'smtp.ethereal.email',

    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'shopdientu.tk@gmail.com', // generated ethereal user
      pass: 'Toikhongbiet!2', // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  // console.log(testAccount)

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'tu toi', // sender address
    to, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html, // html body
  })

  // console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

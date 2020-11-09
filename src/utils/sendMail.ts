import * as nodemailer from 'nodemailer'

export const sendMail = async (to, html) => {
  const config = {
    service: process.env.MAILER_SERVICE,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS
    }
  }

  const transporter = nodemailer.createTransport(config)
  await transporter.sendMail({
    from: '<danil.sokolovskyi@computools.com>',
    to,
    subject: 'Reset Password',
    html
  })
}
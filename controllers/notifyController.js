const axios = require('axios')

const qs = require('qs')

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'jrk-crm@jorakay.co.th',
    pass: 'Jorakay2021'
  },
  tls: {
    ciphers: 'SSLv3'
  }
})

module.exports = {
    line: async(req, res, next) => {
        try {
            const authorization = () => {
                if (req.query.authorization) {
                    return `Bearer ${req.query.authorization}`
                } else if(req.headers.Authorization) {
                    return req.headers.Authorization
                } 
                else if(req.headers.authorization) {
                    return req.headers.authorization
                }
                else {
                    return 'Bearer tkykMAA1ULAZNpKY9XFb5E1LduLboGR0ksYobyz8iLD'
                }
            }
            var axiosHeader = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: authorization() }
            }
              
            await axios.post('https://notify-api.line.me/api/notify', qs.stringify(req.body), axiosHeader).then((response)=> {
                res.send({ success: true, text: 'ข้อความของคุณถูกส่งแล้ว'})
            }).catch((err => {
                throw err
            }))
        } catch (error) {
            next(error)
        }
    },
    email: async(req, res, next) => {
      const mailOptions = req.body
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          next(err)
        } else {
          res.send(info)
        }
      })
    }
}
const axios = require('axios')

module.exports = {
    line: async(req, res, next) => {
        try {
            var axiosHeader = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
            if (req.headers.Authorization) {
                axiosHeader.headers.Authorization = req.headers.Authorization
            } else {
                axiosHeader.headers.Authorization = 'Bearer tkykMAA1ULAZNpKY9XFb5E1LduLboGR0ksYobyz8iLD'
            }
              
            const response = await axios.post('https://notify-api.line.me/api/notify', qs.stringify(req.body), axiosHeader)
            res.send({ success: true, text: 'ข้อความของคุณถูกส่งแล้ว'})
        } catch (error) {
            next(error)
        }
    }
}
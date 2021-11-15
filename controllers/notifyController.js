const axios = require('axios')

module.exports = {
    line: async(req, res, next) => {
        try {
            const authorization = () => {
                if (req.query.authorization) {
                    return `Bearer ${req.query.authorization}`
                } else if(req.headers.Authorization) {
                    return req.headers.Authorization
                } else {
                    return 'Bearer tkykMAA1ULAZNpKY9XFb5E1LduLboGR0ksYobyz8iLD'
                }
            }
            var axiosHeader = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: authorization() }
            }
              
            await axios.post('https://notify-api.line.me/api/notify', qs.stringify(req.body), axiosHeader).then((response)=> {
                res.send({ success: true, text: 'ข้อความของคุณถูกส่งแล้ว'})
            })
        } catch (error) {
            next(error)
        }
    }
}
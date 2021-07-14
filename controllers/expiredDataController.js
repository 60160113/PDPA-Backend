const { default: axios } = require('axios')

const axiosOptions = {
    headers: {
        'Content-Type': 'application/json'
    }
}
async function alfresco_authen() {
    const res = await axios.post(`${process.env.ALFRESCO_API}authentication/versions/1/tickets`, {
        userId: "phurk",
        password: "ivsoft"
    }, axiosOptions)

    return res.data.entry.id
}

module.exports = {
    checkDataExpiration: async(req, res, next) => {
        try {
            const publishedData = await axios.get(`${process.env.BASE_URL}:${process.env.PORT}/personal_data`)

            const TICKET = await alfresco_authen();

            const currentDate = new Date();
            const expiredData = publishedData.data.filter(item => new Date(item.expiredAt).toDateString() === currentDate.toDateString())

            if (expiredData.length > 0) {
                expiredData.forEach((item) => {
                    if (item.publish.isPublished) {
                        axios.delete(`${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${item.publish.id}?alf_ticket=${TICKET}`)
                    }
                    axios.delete(`${process.env.BASE_URL}:${process.env.PORT}/personal_data/${item['_id']}`)
                });
            }
            res.send({ message: `${expiredData.length} items is removed`, data: expiredData })
        } catch (error) {
            next(error)
        }
    }
}
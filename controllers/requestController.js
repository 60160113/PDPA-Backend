const { default: axios } = require('axios')

require('dotenv').config()

const PDPA_BASE_URL = `${process.env.BASE_URL}:${process.env.PORT}/data/request`

async function alfresco_authen(userId = "admin", password = "newpublicosdev") {
    const res = await axios.post(`${process.env.ALFRESCO_API}authentication/versions/1/tickets`, {
        userId,
        password
    })

    return res.data.entry.id
}

module.exports = {
    checkDataExpiration: async(req, res, next) => {
        try {
            const request = await axios.get(`${PDPA_BASE_URL}?status=pending&status=approved`)

            const TICKET = await alfresco_authen();

            const currentDate = new Date();
            const expiredData = request.data.filter(item => new Date(item.expiredAt).toDateString() === currentDate.toDateString() || currentDate.getTime() >= new Date(item.expiredAt).getTime())

            if (expiredData.length > 0) {
                expiredData.forEach(async(item) => {
                    if (item.folder) {
                        await axios.delete(`${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${item.folder}?alf_ticket=${TICKET}`)
                    }
                    await axios.put(`${PDPA_BASE_URL}/${item['_id']}`, {
                        status: "expired",
                        folder: ""
                    })
                });
            }
            res.send({ message: `${expiredData.length} items is removed`, data: expiredData })
        } catch (error) {
            next(error)
        }
    },
    forceExpiration: async(req, res, next) => {
        try {
            const TICKET = await alfresco_authen();

            await axios.delete(`${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${req.params.folder}?alf_ticket=${TICKET}`)

            await axios.put(`${PDPA_BASE_URL}/${req.params.id}`, {
                status: "expired",
                folder: "",
                expiredAt: new Date()
            })

            res.send({ message: `success` })
        } catch (error) {
            next(error)
        }
    }
}
const { default: axios } = require('axios')

const axiosOptions = {
    headers: {
        'Content-Type': 'application/json'
    }
}
async function alfresco_authen(userId = "admin", password = "newpublicosdev") {
    const res = await axios.post(`${process.env.ALFRESCO_API}authentication/versions/1/tickets`, {
        userId,
        password
    }, axiosOptions)

    return res.data.entry.id
}

module.exports = {
    checkDataExpiration: async(req, res, next) => {
        try {
            const publishedData = await axios.get(`${process.env.BASE_URL}:${process.env.PORT}/personal_data?publish.isPublished=true`)

            const TICKET = await alfresco_authen();

            const currentDate = new Date();
            const expiredData = publishedData.data.filter(item => new Date(item.expiredAt).toDateString() === currentDate.toDateString() || currentDate.getTime() >= new Date(item.expiredAt).getTime())

            if (expiredData.length > 0) {
                expiredData.forEach(async(item) => {
                    if (item.publish.isPublished) {
                        await axios.delete(`${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${item.publish.id}?alf_ticket=${TICKET}`)
                    }
                    await axios.put(`${process.env.BASE_URL}:${process.env.PORT}/personal_data/${item['_id']}`, {
                        status: "expired",
                        publish: {
                            isPublished: false,
                            id: ""
                        }
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

            await axios.delete(`${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${req.body.publishId}?alf_ticket=${TICKET}`)

            await axios.put(`${process.env.BASE_URL}:${process.env.PORT}/personal_data/${req.params.id}`, {
                status: "expired",
                publish: {
                    isPublished: false,
                    id: ""
                }
            })

            res.send({ message: `success` })
        } catch (error) {
            next(error)
        }
    }
}
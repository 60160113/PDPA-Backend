const { default: axios } = require('axios')
var path = require("path")
const { exec } = require('child_process');
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const fs = require('fs');

require('dotenv').config()

const PDPA_BASE_URL = `${process.env.BASE_URL}:${process.env.PORT}/data/request_data`

async function alfresco_authen(userId = "admin", password = "newpublicosdev") {
    const res = await axios.post(`${process.env.ALFRESCO_API}authentication/versions/1/tickets`, {
        userId,
        password
    })

    return res.data.entry.id
}

async function pdf_watermark(content, watermark) {
    const pdfDoc = await PDFDocument.load(content);

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const pages = await pdfDoc.getPages()

    const { height } = pages[0].getSize()

    pages.forEach(page => {
        page.drawText(watermark, {
            x: 5,
            y: height - 50,
            size: 50,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.6,
        })
        page.drawText(watermark, {
            x: 5,
            y: 0,
            size: 50,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.6,
        })
        page.drawText(watermark, {
            x: 5,
            y: height / 2,
            size: 50,
            font: helveticaFont,
            color: rgb(0.5, 0.5, 0.5),
            opacity: 0.6,
        })
    });

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
}

module.exports = {
    publish: async(req, res, next) => {
        try {
            const TICKET = await alfresco_authen();

            const requests = await axios({
                method: "get",
                url: `${PDPA_BASE_URL}/${req.params.id}`,
            })

            const folder = await axios({
                method: "post",
                url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${process.env.PUBLISHED_DATA_FOLDER}/children?alf_ticket=${TICKET}&autoRename=true`,
                data: {
                    name: `ร้องขอ${requests.data.name}_โดย_${requests.data.requester.name}`,
                    nodeType: "cm:folder",
                }
            })

            await requests.data.documents.forEach(async document => {
                // get content
                const content = await axios({
                    method: "get",
                    url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${document.id}/content?alf_ticket=${TICKET}`,
                    responseType: "arraybuffer",
                })
                var fileBytes = content.data
                if (document.name.includes(".pdf")) {
                    fileBytes = await pdf_watermark(content.data, requests.data.requester.name)
                }
                const fileName = `${document.name.slice(0, document.name.lastIndexOf("."))}_${document.parent.name.replace(" ", "_")}${document.name.slice(document.name.lastIndexOf("."))}`

                const pathName = path.format({ dir: './temp', base: `${document.id}${document.name.slice(document.name.lastIndexOf("."))}` })

                await fs.writeFile(pathName, fileBytes, async(err) => {
                    if (err) throw err
                    await exec(`curl -F filedata="@${pathName}" -H "Content-Type: multipart/form-data" -X POST --user admin:newpublicosdev ${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${folder.data.entry.id}/children?autoRename=true`, async(err, stdout, stderr) => {
                        fs.unlinkSync(pathName)
                        if (err) {
                            throw err
                        } else {
                            const response = JSON.parse(stdout)

                            await axios({
                                method: "put",
                                url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${response.entry.id}?alf_ticket=${TICKET}`,
                                data: {
                                    name: fileName,
                                    permissions: {
                                        isInheritanceEnabled: false,
                                        locallySet: [{
                                            authorityId: requests.data.requester.id,
                                            name: "Consumer",
                                            accessStatus: "ALLOWED"
                                        }]
                                    }
                                },
                            })
                        }
                    })
                })
            });
            await axios({
                method: "put",
                url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${folder.data.entry.id}?alf_ticket=${TICKET}`,
                data: {
                    permissions: {
                        isInheritanceEnabled: false,
                        locallySet: [{
                            authorityId: requests.data.requester.id,
                            name: "Consumer",
                            accessStatus: "ALLOWED"
                        }]
                    }
                },
            })

            const date = new Date()
            date.setDate(date.getDate() + 7);

            await axios({
                method: "put",
                url: `${PDPA_BASE_URL}/${req.params.id}`,
                data: {
                    folder: folder.data.entry.id,
                    expiredAt: req.body.expiredAt || date,
                    status: "approved"
                },
            })

            res.send({ id: folder.data.entry.id })
        } catch (error) {
            next(error)
        }
    },
    checkDataExpiration: async(req, res, next) => {
        try {
            const requestData = await axios.get(`${PDPA_BASE_URL}?status=pending&status=approved`)

            const TICKET = await alfresco_authen();

            const currentDate = new Date();
            const expiredData = requestData.data.filter(item => new Date(item.expiredAt).toDateString() === currentDate.toDateString() || currentDate.getTime() >= new Date(item.expiredAt).getTime())

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
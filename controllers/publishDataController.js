const { default: axios } = require('axios')
var path = require("path")
const { exec } = require('child_process');
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const fs = require('fs');

require('dotenv').config()

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
            y: height / 2 + 300,
            size: 50,
            font: helveticaFont,
            color: rgb(0.95, 0.1, 0.1),
            rotate: degrees(-45),
        })
    });

    const pdfBytes = await pdfDoc.save()
    return pdfBytes
}

module.exports = {
    publish: async(req, res, next) => {
        try {
            const TICKET = await alfresco_authen();

            // get content
            const content = await axios({
                method: "get",
                url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${req.body.data.id}/content?alf_ticket=${TICKET}`,
                responseType: "arraybuffer",
            })

            var fileBytes = content.data
            if (req.body.data.name.includes(".pdf")) {
                fileBytes = await pdf_watermark(content.data, req.body.requester.name)
            }

            const fileName = `${req.body.data.name.slice(0, req.body.data.name.lastIndexOf("."))}_${req.body.requester.name.replace(" ", "_")}${req.body.data.name.slice(req.body.data.name.lastIndexOf("."))}`

            const pathName = path.format({ dir: './temp', base: fileName })
            fs.writeFile(pathName, fileBytes, async(err) => {
                if (err) throw err
                exec(`curl -F filedata="@${pathName}" -H "Content-Type: multipart/form-data" -X POST --user admin:newpublicosdev ${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${process.env.PUBLISHED_DATA_FOLDER}/children`, async(err, stdout, stderr) => {
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
                                        authorityId: req.body.requester.id,
                                        name: "Consumer",
                                        accessStatus: "ALLOWED"
                                    }]
                                }
                            },
                        })

                        var publishObject = {
                            isPublished: true,
                            id: response.entry.id
                        }

                        if (req.body.expiredAt) {
                            publishObject.expiredAt = req.body.expiredAt
                        }

                        await axios({
                            method: "put",
                            url: `${process.env.BASE_URL}:${process.env.PORT}/personal_data/${req.params.id}`,
                            data: {
                                publish: publishObject
                            },
                        })

                        res.send({ id: response.entry.id })
                    }
                })
            })
        } catch (error) {
            next(error)
        }
    }
}
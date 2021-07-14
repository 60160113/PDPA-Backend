const { default: axios } = require('axios')
var path = require("path")
const { exec } = require('child_process');
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const fs = require('fs');

require('dotenv').config()

module.exports = {
    publish: async(req, res, next) => {
        try {
            if (!req.headers.authorization) {
                res.status(401).send('Authentication fail')
            } else {
                // get content
                const content = await axios({
                    method: "get",
                    url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${req.body.data.id}/content`,
                    responseType: "arraybuffer",
                    headers: req.headers
                })

                // watermark
                const pdfDoc = await PDFDocument.load(content.data);

                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

                const pages = await pdfDoc.getPages()

                const { width, height } = pages[0].getSize()

                pages.forEach(page => {
                    page.drawText(req.body.requester.name, {
                        x: 5,
                        y: height / 2 + 300,
                        size: 50,
                        font: helveticaFont,
                        color: rgb(0.95, 0.1, 0.1),
                        rotate: degrees(-45),
                    })
                });

                const pdfBytes = await pdfDoc.save()

                const fileName = `${req.body.data.name.replace(".pdf", "")}_${req.body.requester.name.replace(" ", "_")}.pdf`

                const pathName = path.format({ dir: './temp', base: fileName })
                fs.writeFile(pathName, pdfBytes, async(err) => {
                    if (err) throw err
                    exec(`curl -F filedata="@${pathName}" -H "Content-Type: multipart/form-data" -X POST --user admin:newpublicosdev ${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${process.env.PUBLISHED_DATA_FOLDER}/children`, async(err, stdout, stderr) => {
                        fs.unlinkSync(pathName)

                        if (err) {
                            throw err
                        } else {
                            const response = JSON.parse(stdout)

                            await axios({
                                method: "put",
                                url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${response.entry.id}`,
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
                                headers: req.headers
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
            }
        } catch (error) {
            next(error)
        }
    }
}
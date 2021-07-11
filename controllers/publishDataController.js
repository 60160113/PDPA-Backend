const { default: axios } = require('axios')

const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const fs = require('fs');

var { FormData, File, fileFromPath } = require('formdata-node');

const Blob = require('node-blob');

const base64 = require('base64topdf');

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

                const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });

                const fileName = `${req.body.data.name.replace(".pdf", "")}_${req.body.requester.name.replace(" ", "_")}.pdf`

                const path = `./temp/${fileName}`

                // const blob = await new Blob([pdfBytes], { type: "application/pdf" });

                // const file = new File([blob], fileName)
                // console.log(file);

                // fs.writeFile(path, pdfBytes, async(err) => {
                //     if (err) throw err;

                var formData = new FormData();
                // formData.append(
                //     "filedata",
                //     fileFromPath(path),
                //     fileName
                // );
                // formData.set("filedata", fs.createReadStream(path))
                // console.log(formData);
                // upload
                // var formData = new FormData();
                formData.append(
                    "filedata",
                    file
                );
                const publish = await axios({
                    method: "post",
                    url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${process.env.PUBLISHED_DATA_FOLDER}/children?autoRename=true`,
                    data: formData,
                    headers: {...req.headers, 'content-Type': 'multipart/form-data' }
                })

                const url = `${process.env.PUBLISHED_BASE_URL}${publish.data.entry.id}`

                res.send({ url })
                    // });
            }
        } catch (error) {
            next(error)
        }
    }
}
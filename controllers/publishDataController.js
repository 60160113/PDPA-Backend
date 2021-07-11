const { default: axios } = require('axios')
var request = require('request')
var path = require("path")
const { exec } = require('child_process');
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const fs = require('fs');

var { FormData, File, fileFromPath } = require('formdata-node');

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
                
                const pathName = path.format({ dir: 'D:\\Develop\\project\\PDPA-Backend\\controllers', base: 'test.pdf' })
                fs.writeFile(pathName, pdfBytes, async (err) => {
                    if (err) throw err
                    exec(`curl -F filedata="@${pathName}" -H "Content-Type: multipart/form-data" -X POST --user admin:newpublicosdev http://ecm.osdev.co.th:8082/alfresco/api/-default-/public/alfresco/versions/1/nodes/fb77954b-df36-4636-aa76-9166f51db9e2/children`, (err, stdout, stderr) => {
                        if (err) {
                          //some err occurred
                          console.error(err)
                        } else {
                         // the *entire* stdout and stderr (buffered)
                         console.log(`stdout: ${stdout}`);
                         console.log(`stderr: ${stderr}`);
                        }
                    })
                })
                // var formData = new FormData();
                // formData.append(
                //     "filedata",
                //     fileFromPath(path),
                //     fileName
                // })
                // formData.set("filedata", fs.createReadStream(path))
                // console.log(formData);
                // upload
                // var formData = new FormData();
                
                
                
                
                // formData.append(
                //     "filedata",
                //     file
                // );
                // const publish = await axios({
                //     method: "post",
                //     url: `${process.env.ALFRESCO_API}alfresco/versions/1/nodes/${process.env.PUBLISHED_DATA_FOLDER}/children?autoRename=true`,
                //     data: formData,
                //     headers: {...req.headers, 'content-Type': 'multipart/form-data' }
                // })

                // const url = `${process.env.PUBLISHED_BASE_URL}${publish.data.entry.id}`

                // res.send({ url })
                    // });
            }
        } catch (error) {
            next(error)
        }
    }
}
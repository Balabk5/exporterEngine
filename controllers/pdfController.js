import puppeteer from 'puppeteer';
import hbs from 'handlebars'
import fs from 'fs-extra'
import * as path from 'path';

const headerImgPath = path.join(process.cwd(), "assests", "kaartechlogo.png")

const headerimgbase64 = fs.readFileSync(headerImgPath).toString('base64')

const pdfController={

    generatePdf: async function (req, res) {
        const filename = Math.random() + "_doc" + ".pdf";
        const PDFgeneratedFilePath = path.join(process.cwd(),".", "docs", filename);
        
        const tabledata = req.body.tabledata

        // *spliting object key and values
        const values = tabledata.map(doc => Object.values(doc));
        const parameterNames = Object.keys(tabledata [0]);

        const tableDataWithObjectName = {
          "table":values,
          "tableHeaders":parameterNames
        }

        // res.status(200).send(tableDataWithObjectName.tableHeaders)

        // *implementing puppeteer for pdf generation
        const compile = async function (templateName, tableData) {
          const filePath = path.join(process.cwd(),".", "templates", `${templateName}.hbs`);
        
          const html = await fs.readFile(filePath, "utf8");
          return hbs.compile(html)(tableData);
        };
        
        (async function () {
          try {
            const browser = await puppeteer.launch();
        
            const page = await browser.newPage();
        
            const content = await compile("index", tableDataWithObjectName);
        
            await page.setContent(content);
          
        
            await page.pdf({
                displayHeaderFooter:true,
              headerTemplate:
              ` <div style="height:auto; width:100%; background-color:wheat; display: flex;  border-bottom: 1px ridge;">
                  <div style="height: inherit; width: 20%; padding-left:10px;">
                    <img src="data:image/jpeg;base64,${headerimgbase64}" alt="alt text" style="height:75px; width:75px; " />
                  </div>
                  <div style=" height: inherit; width: 80%; text-align: right; font-size: 7px; padding:10px 20px 0 0">
                    <p> 136, Arcot Rd, AVM Nagar,<br> Saligramam, Chennai,<br> Tamil Nadu 600093</p>
                    <p>987654321</p>
                    <p>writeus@kaartech.com</p>
                    <p>www.kaartech.com</p>
                  </div>
                </div>`,
              footerTemplate:
                '<div style="font-size: 10px; width:100%; text-align: right; padding-right: 30px;"> <span class="pageNumber"></span></div>',
              margin: {
                top: "165px",
                bottom: "125px",
                right: "60px",
                left: "60px",
              },
              path: "./docs/" + filename,
              format: "A4",
        
              printBackground: true,
            });
            
            console.log("done creating pdf");
         
            await browser.close();
        
            // process.exit();
          } catch (e) {
            console.log(e);
          }
        })();
        

        console.log(parameterNames);
        res.status(200).send(PDFgeneratedFilePath)
       
      },

}

export default pdfController
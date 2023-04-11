import puppeteer from "puppeteer";
import hbs from "handlebars";
import fs from "fs-extra";
import * as path from "path";
import AWS from "aws-sdk";
import fetch from "node-fetch";
import { Stream } from "stream";
import { response } from "express";
import aPIkeyandendpoints from "../models/apiData.js";
import axios from "axios";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const headerImgPath = path.join(process.cwd(), "assests", "kaartechlogo.png");

const headerimgbase64 = fs.readFileSync(headerImgPath).toString("base64");

const pdfController = {
  generatePdf: async function (req, res) {
    const filename = Math.random() + "_doc" + ".pdf";
    const PDFgeneratedFilePath = path.join(
      process.cwd(),
      ".",
      "docs",
      filename
    );

    const tabledata = req.body.tabledata;

    // *spliting object key and values
    const values = tabledata.map((doc) => Object.values(doc));
    const parameterNames = Object.keys(tabledata[0]);

    const tableDataWithObjectName = {
      table: values,
      tableHeaders: parameterNames,
    };

    // res.status(200).send(tableDataWithObjectName.tableHeaders)

    // *implementing puppeteer for pdf generation
    const compile = async function (templateName, tableData) {
      const filePath = path.join(
        process.cwd(),
        ".",
        "templates",
        `${templateName}.hbs`
      );

      const html = await fs.readFile(filePath, "utf8");
      return hbs.compile(html)(tableData);
    };

    (async function () {
      try {
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        const content = await compile("index", tableDataWithObjectName);

        await page.setContent(content);

        const pdf = await page.pdf({
          displayHeaderFooter: true,
          headerTemplate: ` <div style="height:auto; width:100%; background-color:wheat; display: flex;  border-bottom: 1px ridge;">
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
          // path: "./docs1/" + filename,
          format: "A4",

          printBackground: true,
        });

        console.log("done creating pdf");

        var params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filename,
          Body: pdf,
          ContentType: "application/pdf",
        };

        // s3.putObject(params).promise()

        s3.upload(params, (err, data) => {
          if (err) {
            console.log(err);
          }
          console.log(data);
          console.log(data.Location);
          // res.download(data.Location)

          params = { Bucket: process.env.AWS_BUCKET_NAME, Key: data.Key };
          var url = s3.getSignedUrl("getObject", params);
          console.log("The URL is", url);
          res.status(200).send(data.Key);
        });

        await browser.close();

        // process.exit();
      } catch (e) {
        console.log(e);
      }
    })();
  },

  downloadPdf: async function (req, res) {
    try {
      const url = req.query.url;
      console.log(url);
      // res.download(url)
      s3.getObject(
        { Bucket: process.env.AWS_BUCKET_NAME, Key: url },
        (err, data) => {
          if (err) {
            console.log(err);
          }
          console.log(data);
          // var readStream = new Stream.PassThrough()
          // readStream.end(data.Body)
          // readStream.pipe(res)
          // fs.writeFile('./docs/'+url,data.Body, () => {
          //   res.download('./docs/'+url,url)
          // })
          res.setHeader("Content-disposition", "attachment; filename=" + url);
          res.setHeader("Content-Type", "application/octet-stream");
          res.end(data.Body);
          // res.end(download)

          // res.download(data)
          // res.end(data.Body);
        }
      );
      // console.log(data)
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    }
  },
  generatePdfByCallingApi: async function (req, res) {
    // let URLlastpart = req.body.URLlastpart
    try {
      let urlParams = req.body.urlParams;

      // const resultUrl = await aPIkeyandendpoints.find({Endpoints: { $regex: urlParams.urlEndPart, $options: "i" }},{Endpoints:1})
      const resultUrl = await aPIkeyandendpoints.find(
        { Endpoints: { $elemMatch: { $regex: urlParams.urlEndPart } } },
        { Endpoints: { $elemMatch: { $regex: urlParams.urlEndPart } } }
      );
      let resultUrlFinal = resultUrl[0].Endpoints[0];

      let resultUrlFinalWithParama = `${resultUrlFinal}?page=${urlParams.page}&limit=10&search=${urlParams.search}&sort=${urlParams.sort.sort},${urlParams.sort.order}&collectionName=${urlParams.collectionName},&searchProperty=${urlParams.searchProperty}`;
      // console.log(resultUrlFinalWithParama)

      axios.get(resultUrlFinalWithParama).then((response) => {
        // console.log(response.data);
        const tabledata = response.data.resultTableData
        const values = tabledata.map((doc) => Object.values(doc));
        const parameterNames = Object.keys(tabledata[0]);
    
        const tableDataWithObjectName = {
          table: values,
          tableHeaders: parameterNames,
        };
        console.log(tableDataWithObjectName)
      });


      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    }
  },
};

export default pdfController;

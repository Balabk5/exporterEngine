import { Router } from "express";
import pdfController from "../controllers/pdfController.js"
import gettingDataFromAPI from "../controllers/dataSource.js"

const router = Router();

router.post('/generatePdf',pdfController.generatePdf)
router.get('/downloadPdf', pdfController.downloadPdf)
router.post('/collectAPI', gettingDataFromAPI.gettingDataFromAPI)
router.post('/generatePdfUsingapi', pdfController.generatePdfByCallingApi)





export default router
import { Router } from "express";
import pdfController from "../controllers/pdfController.js"
const router = Router();

router.post('/generatePdf',pdfController.generatePdf)
router.get('/downloadPdf', pdfController.downloadPdf)




export default router
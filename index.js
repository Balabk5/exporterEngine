import express, { json, urlencoded } from "express";
import cors from "cors";
import { set, connect } from "mongoose";
import * as dotenv from 'dotenv';
import  router  from "./router/routes.js";

dotenv.config()

const app = express();
app.use(json());

app.use(urlencoded({extended:true}));
app.use(cors());
app.options("*",cors());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));


  app.use('/',router);
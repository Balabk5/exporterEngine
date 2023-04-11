import express, { json, urlencoded } from "express";
import cors from "cors";
import { set, connect } from "mongoose";
import mongoose from 'mongoose';

import * as dotenv from 'dotenv';
import  router  from "./router/routes.js";

dotenv.config()

const app = express();
app.use(json({limit: '50mb'}));

app.use(urlencoded({extended:true}));
app.use(cors());
app.options("*",cors());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));



  app.use('/',router);

  app.use('/files',express.static('docs'))
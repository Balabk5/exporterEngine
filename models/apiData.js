import { Schema,model } from "mongoose";

const APIkeyandendpoints = Schema({
    apiKey: {type:String},
    Endpoints: {type:Array}
})

const aPIkeyandendpoints = model("APIkeyandendpoints",APIkeyandendpoints)

export default aPIkeyandendpoints
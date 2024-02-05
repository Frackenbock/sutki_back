const express = require("express");
const cors = require("cors");
const sutkiRouter = require("./src/routers/sutkiRouter");
const itogRouter = require("./src/routers/itogRouter");
const pbr_aiiskueRouter = require("./src/routers/pbr_aiiskueRouter");
const pbrRouter = require("./src/routers/pbrRouter");
const maketRouter = require("./src/routers/maketRouter");
const vspRouter = require("./src/routers/vspRouter");
const adminRouter = require("./src/routers/adminRouter");
const adminMaketRouter = require("./src/routers/adminMaketRouter");
const logsRouter = require("./src/routers/logsRouter");

const PORT = process.env.PORT ?? 5001;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/sutki",sutkiRouter);
app.use("/pbr_aiiskue",pbr_aiiskueRouter);
app.use("/pbr",pbrRouter);
app.use("/itog",itogRouter);
app.use("/maket",maketRouter);
app.use("/vsp",vspRouter);
app.use("/admin",adminRouter);
app.use("/logs",logsRouter);
app.use("/adminmaket",adminMaketRouter);

app.listen(PORT,()=>{
    console.log("Sutki server work");
});  
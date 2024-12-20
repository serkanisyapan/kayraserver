import express from "express";
import cors from "cors";
import sql from "mssql";
import { raporlar } from "./queries.js";

const PORT = process.env.SERVER_PORT;
const HOST = process.env.SERVER_HOST;
const app = express();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.USER_PASSWORD,
    server: process.env.SERVER_NAME,
    database: process.env.DB_NAME,
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true
    },
    port: parseInt(process.env.DB_PORT)
};
const appPool = new sql.ConnectionPool(dbConfig);

app.use(cors());

app.get('/detayraporlari', (req, res) => {
    const rapor = raporlar[req.query.rapor]
    req.app.locals.db.query(rapor, function(err, recordset) {
    if (err) {
      console.error(err)
      res.status(500).send('something went wrong...')
      return
    }
    return res.json(recordset)
  })
})

// connect the pool and start the web server when done// connects to 
appPool.connect().then(function(pool) {
  app.locals.db = pool;
  const server = app.listen(3000, function () {
    const host = server.address().address
    const port = server.address().port
    console.log('connected to db...', host, port)
  })
}).catch(function(err) {
  console.error('Error creating connection pool', err)
});

app.listen(PORT, HOST, (req, res) => {
    console.log(`server running on port: ${PORT} and host: ${HOST}`)
})
import express from "express";
import cors from "cors";
import sql from "mssql";
import { raporlar } from "./queries.js";

const PORT = process.env.SERVER_PORT;
const app = express();
const dbConfig = {
	user: process.env.DB_USER,
	password: process.env.USER_PASSWORD,
	server: process.env.SERVER_NAME,
	database: process.env.DB_NAME,
	options: {
		trustServerCertificate: true,
		trustedConnection: false,
		enableArithAbort: true,
	},
	port: Number.parseInt(process.env.DB_PORT),
};
const appPool = new sql.ConnectionPool(dbConfig);

app.use(cors());
app.use(express.json());

// seçtiğimiz raporu getirir
app.get("/detayraporlari", (req, res) => {
	const rapor = raporlar[req.query.rapor];
	req.app.locals.db.query(rapor, (err, recordset) => {
		if (err) {
			console.error(err);
			res.status(500).send("something went wrong...");
			return;
		}
		return res.json(recordset);
	});
});

// seçtiğimiz siparişleri kapatır
app.patch("/sipariskapat", (req, res) => {
	const { siparisler } = req.body;
	if (!siparisler)
		return res.status(500).send({ message: "Kapatılacak sipariş yoktur" });
	const siparisKapaQuery = raporlar.siparisKapa(siparisler);
	req.app.locals.db.query(siparisKapaQuery, (err, recordset) => {
		if (err) {
			console.error(err);
			res.status(500).send({ message: "Siparişler kapatılamadı" });
			return;
		}
		return res.status(200).send({ message: "Siparişler kapatılmıştır." });
	});
});

// connect the pool and start the web server when done
appPool
	.connect()
	.then((pool) => {
		app.locals.db = pool;
		const server = app.listen(3000, () => {
			const host = server.address().address;
			const port = server.address().port;
			console.log("connected to db...", host, port);
		});
	})
	.catch((err) => {
		console.error("Error creating connection pool", err);
	});

// server starts listening
app.listen(PORT, (req, res) => {
	console.log(`server running on port: ${PORT}`);
});

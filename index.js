//the following two are required to replace __dirname because of ESM modules
import {dirname} from "path"
import {fileURLToPath} from "url"

import express from "express"
const app = express()
app.set("view engine", "ejs")
app.use(express.urlencoded())
const port = process.env.PORT || 8080

import {init, newGuide, getGuides, allGuides, approveGuide, deleteGuide} from "./db.js"
await init()

app.get("/", (req, res) => {
	res.sendFile("views/index.html", {root: dirname(fileURLToPath(import.meta.url))})
})
app.get("/guides", async (req, res) => {
	res.json(await getGuides())
})
app.get("/approve", async (req, res) => {
	res.render("approve.ejs", {guides: await allGuides()})
})
app.post("/approve", async (req, res) => {
	if (req.body.code !== (process.env.CODE || "test")) {
		res.send("Invalid code!")
		return
	}
	Object.entries(req.body).forEach(e => {
		if (e[0] === "code" || e[1] !== "on" || !/(?:delete|approve)\d+/.test(e[0])) return
		if (e[0].startsWith("delete")) deleteGuide(Number(e[0].slice("delete".length)))
		if (e[0].startsWith("approve")) approveGuide(Number(e[0].slice("approve".length)))
	})
	res.redirect("/approve")
})
app.post("/submit", async (req, res) => {
	if (!req.body.submittedBy || !req.body.title || !req.body.subject || !req.body.link || !req.body.email) {
		res.send(400, "One or more parameters is missing!")
		return
	}
	await newGuide({
		submittedBy: req.body.submittedBy,
		title: req.body.title,
		subject: req.body.subject,
		link: req.body.link,
		email: req.body.email
	})
	res.redirect("https://stuyjuniorcaucus.github.io/study_guides.html")
})

app.listen(port, () => console.log("Started"))

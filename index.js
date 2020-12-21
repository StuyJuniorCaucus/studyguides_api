import express from "express"
const app = express()
const port = process.env.PORT || 8080

import {init, newGuide, getGuides, approveGuide} from "./db.js"
await init()

app.get("/", (req, res) => {
	res.send("Hello, world!")
})

app.listen(port, () => console.log("Started"))

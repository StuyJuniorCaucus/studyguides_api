import pg from "pg"
const {Client} = pg
const client = new Client({
	//if you're not victor and you're reading this, you might
	//need to change the below value
	connectionString: process.env.DATABASE_URL || "postgresql://victor@localhost/studyguides",
//	ssl: process.env.DATABASE_URL === "" ? false : {rejectUnauthorized: false}
	ssl: false
})
const init = async () => {
	await client.connect()
	await client.query("CREATE TABLE IF NOT EXISTS studyguides (id SERIAL PRIMARY KEY, submittedBy TEXT, title TEXT, subject TEXT, approved BOOLEAN, link TEXT, email TEXT)")
	await client.query("CREATE TABLE IF NOT EXISTS updates (id SERIAL PRIMARY KEY, date TIMESTAMP, title TEXT, body TEXT)")
	await client.query("CREATE TABLE IF NOT EXISTS documents (id SERIAL PRIMARY KEY, date TIMESTAMP, title TEXT, body TEXT, category TEXT)")
	console.log("DB initialized")
}

const newGuide = async ({submittedBy, title, subject, link, email}) => {
	if (!submittedBy || !title || !subject || !link || !email) throw new Error("One or more of the parameters is missing!")
	await client.query("INSERT INTO studyguides(submittedBy, title, subject, link, email, approved) VALUES ($1, $2, $3, $4, $5, FALSE)", [submittedBy, title, subject, link, email])
}
const getGuides = async () => {
	const res = await client.query("SELECT * FROM studyguides WHERE approved=TRUE")
	return res.rows
}
const allGuides = async () => {
	const res = await client.query("SELECT * FROM studyguides")
	return res.rows
}
const approveGuide = async ({id}) => {
	if (!id) throw new Error("No guide ID given!")
	await client.query("UPDATE studyguides SET approved=TRUE WHERE id=$1", [id])
}
const deleteGuide = async ({id}) => {
	if (!id) throw new Error("No guide ID given!")
	await client.query("DELETE FROM studyguides WHERE id=$1", [id])
}

const newUpdate = async ({title, body}) => {
	if (!title || !body) throw new Error("One of the parameters is missing!")
	await client.query("INSERT INTO updates(date, title, body) VALUES ($1, $2, $3)", [new Date(), title, body])
}
const editUpdate = async ({title, body, id}) => {
	if (!id) throw new Error("No update ID given!")
	if (!(title || body)) throw new Error("No edit parameters given!")
	const res = await client.query("SELECT 1 FROM updates WHERE id=$1", [id])
	if (res.rows.length < 1) throw new Error("No update found for ID given!")
	if (title) await client.query("UPDATE TABLE updates SET title=$1 WHERE id=$2", [title, id])
	if (body) await client.query("UPDATE TABLE updates SET body=$1 WHERE id=$2", [body, id])
}
const deleteUpdate = async ({id}) => {
	if (!id) throw new Error("No update ID given!")
	await client.query("DELETE FROM updates WHERE id=$1", [id])
}
const getUpdates = async () => {
	const res = await client.query("SELECT * FROM updates ORDER BY date DESC")
	return res.rows
}

const newDoc = async ({title, body, category}) => {
	if (!title || !body || !category) throw new Error("One of the parameters is missing!")
	await client.query("INSERT INTO documents(date, title, body, category) VALUES ($1, $2, $3, $4)", [new Date(), title, body, category])
}
const editDoc = async ({title, body, category, id}) => {
	if (!id) throw new Error("No update ID given!")
	if (!(title || body || category)) throw new Error("No edit parameters given!")
	const res = await client.query("SELECT 1 FROM documents WHERE id=$1", [id])
	if (res.rows.length < 1) throw new Error("No update found for ID given!")
	if (title) await client.query("UPDATE TABLE documents SET title=$1 WHERE id=$2", [title, id])
	if (body) await client.query("UPDATE TABLE documents SET body=$1 WHERE id=$2", [body, id])
	if (category) await client.query("UPDATE TABLE documents SET category=$1 WHERE id=$2", [category, id])
}
const deleteDoc = async ({id}) => {
	if (!id) throw new Error("No update ID given!")
	await client.query("DELETE FROM documents WHERE id=$1", [id])
}
const getDocs = async () => {
	const res = await client.query("SELECT * FROM documents ORDER BY date DESC")
	return res.rows
}

export default {
	init,
	guides: {
		new: newGuide,
		get: getGuides,
		all: allGuides,
		approve: approveGuide,
		delete: deleteGuide
	},
	updates: {
		new: newUpdate,
		get: getUpdates,
		delete: deleteUpdate,
		edit: editUpdate
	},
	documents: {
		new: newDoc,
		get: getDocs,
		delete: deleteDoc,
		edit: editDoc
	}
}

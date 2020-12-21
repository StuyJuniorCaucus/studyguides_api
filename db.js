import pg from "pg"
const {Client} = pg
const client = new Client({
	//if you're not victor and you're reading this, you might
	//need to change the below value
	connectionString: process.env.DATABASE_URL || "postgresql://victor@localhost/studyguides",
	ssl: process.env.DATABASE_URL !== ""
})
const init = async () => {
	await client.connect()
	await client.query("CREATE TABLE IF NOT EXISTS studyguides (id SERIAL PRIMARY KEY, submittedBy TEXT, title TEXT, subject TEXT, approved BOOLEAN, link TEXT)")
	console.log("DB initialized")
}

const newGuide = async ({submittedBy, title, subject, link}) => {
	if (!submittedBy || !title || !subject || !link) throw new Error("One or more of the parameters is missing!")
	await client.query("INSERT INTO studyguides(submittedBy, title, subject, link, approved) VALUES ($1, $2, $3, $4, FALSE)", [submittedBy, title, subject, link])
}
const getGuides = async () => {
	return await client.query("SELECT * FROM studyguides WHERE approved=TRUE")
}
const approveGuide = async id => {
	await client.query("UPDATE TABLE studyguides SET approved=TRUE WHERE id=$1", [id])
}

export {init, newGuide, getGuides, approveGuide}

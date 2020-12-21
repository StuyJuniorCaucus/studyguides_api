import pg from "pg"
const {Client} = pg
const client = new Client({
	//if you're not victor and you're reading this, you might
	//need to change the below value
	connectionString: process.env.DATABASE_URL || "postgresql://victor@localhost/studyguides",
	ssl: process.env.DATABASE_URL === "" ? false : {rejectUnauthorized: false}
})
const init = async () => {
	await client.connect()
	await client.query("CREATE TABLE IF NOT EXISTS studyguides (id SERIAL PRIMARY KEY, submittedBy TEXT, title TEXT, subject TEXT, approved BOOLEAN, link TEXT, email TEXT)")
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
const approveGuide = async id => {
	await client.query("UPDATE studyguides SET approved=TRUE WHERE id=$1", [id])
}
const deleteGuide = async id => {
	await client.query("DELETE FROM studyguides WHERE id=$1", [id])
}

export {init, newGuide, getGuides, allGuides, approveGuide, deleteGuide}

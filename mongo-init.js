
db = db.getSiblingDB('besttime');

db.createUser({
    user: "besttimeUser",
    pwd: "besttimePass",
    roles: [{ role: "readWrite", db: "besttime" }]
});
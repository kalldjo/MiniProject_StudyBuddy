require('dotenv').config({ path: __dirname + '/.env' });
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function seedNeo4j() {
  const session = driver.session();
  try {
    console.log("Checking if dummy users already exist...");
    const checkRes = await session.run("MATCH (u:User) WHERE u.id STARTS WITH 'dummy_' RETURN count(u) AS c");
    const count = checkRes.records[0].get('c').toNumber();
    if (count > 0) {
      console.log(`Found ${count} dummy users. Deleting them to start fresh...`);
      await session.run("MATCH (u:User) WHERE u.id STARTS WITH 'dummy_' DETACH DELETE u");
    }

    console.log("Creating 1000 dummy users in Neo4j (Batch)...");
    const usersToCreate = [];
    for (let i = 1; i <= 1000; i++) {
       usersToCreate.push({ id: `dummy_${i}`, name: `Dummy User ${i}`, email: `dummy${i}@test.com` });
    }

    // Insert 1000 Users
    await session.run(`
      UNWIND $users AS u
      CREATE (n:User {id: u.id, name: u.name, email: u.email, isDummy: true})
    `, { users: usersToCreate });

    console.log("Creating 5000 random IS_FRIENDS_WITH relationships...");
    const friendships = [];
    const userIds = usersToCreate.map(u => u.id);
    
    for (let i = 0; i < 5000; i++) {
        const u1 = userIds[Math.floor(Math.random() * userIds.length)];
        let u2 = userIds[Math.floor(Math.random() * userIds.length)];
        while(u1 === u2) u2 = userIds[Math.floor(Math.random() * userIds.length)];
        
        friendships.push({ u1, u2 });
    }

    await session.run(`
      UNWIND $rels AS rel
      MATCH (a:User {id: rel.u1})
      MATCH (b:User {id: rel.u2})
      MERGE (a)-[:IS_FRIENDS_WITH]->(b)
      MERGE (b)-[:IS_FRIENDS_WITH]->(a)
    `, { rels: friendships });

    console.log("Creating Skills and Interests nodes and relationships...");
    const skills = ["JavaScript", "Python", "Neo4j", "React", "Next.js", "SQL", "Machine Learning", "Data Analysis", "UI/UX", "Node.js"];
    const interests = ["Web Development", "Artificial Intelligence", "Graph Databases", "Reading", "Sports", "Music", "Photography", "Gaming", "Traveling"];

    // Make sure skill/interest nodes exist (MERGE)
    for (const s of skills) {
      await session.run("MERGE (sk:Skill {name: $s})", { s });
    }
    for (const i of interests) {
      await session.run("MERGE (int:Interest {name: $i})", { i });
    }

    // Connect dummy users to random skills/interests
    const userAttrRels = [];
    for (const uId of userIds) {
      // 1-3 random skills
      const numSkills = Math.floor(Math.random() * 3) + 1;
      for(let i=0; i<numSkills; i++) {
        userAttrRels.push({ uId, type: 'HAS_SKILL', val: skills[Math.floor(Math.random() * skills.length)] });
      }
      // 1-3 random interests
      const numInterests = Math.floor(Math.random() * 3) + 1;
      for(let i=0; i<numInterests; i++) {
        userAttrRels.push({ uId, type: 'INTERESTED_IN', val: interests[Math.floor(Math.random() * interests.length)] });
      }
    }

    // Insert user-skill relationships
    const skillRels = userAttrRels.filter(r => r.type === 'HAS_SKILL');
    await session.run(`
      UNWIND $rels AS rel
      MATCH (u:User {id: rel.uId})
      MATCH (s:Skill {name: rel.val})
      MERGE (u)-[:HAS_SKILL]->(s)
    `, { rels: skillRels });

    // Insert user-interest relationships
    const intRels = userAttrRels.filter(r => r.type === 'INTERESTED_IN');
    await session.run(`
      UNWIND $rels AS rel
      MATCH (u:User {id: rel.uId})
      MATCH (i:Interest {name: rel.val})
      MERGE (u)-[:INTERESTED_IN]->(i)
    `, { rels: intRels });

    console.log("Seed successful!");
  } catch (err) {
    console.error("Error seeding:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedNeo4j();
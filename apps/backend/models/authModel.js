const { getSession } = require('../config/neo4j');

const createUser = async (id, email, passwordHash, name, bio, profilePicture) => {
  const session = getSession();
  try {
    const query = `
      CREATE (u:User {
        id: $id, 
        email: $email, 
        password: $passwordHash, 
        name: $name, 
        bio: $bio, 
        profilePicture: $profilePicture
      })
      RETURN u
    `;
    const result = await session.run(query, { id, email, passwordHash, name, bio, profilePicture });
    return result.records[0]?.get('u').properties;
  } finally {
    await session.close();
  }
};

const getUserByEmail = async (email) => {
  const session = getSession();
  try {
    const query = `MATCH (u:User {email: $email}) RETURN u`;
    const result = await session.run(query, { email });
    return result.records.length ? result.records[0].get('u').properties : null;
  } finally {
    await session.close();
  }
};

module.exports = { createUser, getUserByEmail };

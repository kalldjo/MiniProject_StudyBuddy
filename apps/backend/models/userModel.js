const { getSession } = require('../config/neo4j');

const updateProfile = async (userId, name, bio, profilePicture) => {
  const session = getSession();
  try {
    const query = `
      MATCH (u:User {id: $userId})
      SET u.name = $name, u.bio = $bio, u.profilePicture = $profilePicture
      RETURN u
    `;
    const result = await session.run(query, { userId, name, bio, profilePicture });
    return result.records[0]?.get('u').properties;
  } finally {
    await session.close();
  }
};

const updateAcademic = async (userId, type, newValue) => {
  const session = getSession();
  try {
    let relType, nodeLabel;
    if (type === 'fakultas') {
      relType = 'BELONGS_TO_FAKULTAS';
      nodeLabel = 'Fakultas';
    } else if (type === 'jurusan') {
      relType = 'MAJORS_IN';
      nodeLabel = 'Jurusan';
    } else if (type === 'angkatan') {
      relType = 'CLASS_OF';
      nodeLabel = 'Angkatan';
    }

    const query = `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[r:${relType}]->()
      DELETE r
      WITH u
      MERGE (n:${nodeLabel} {${type === 'angkatan' ? 'year' : 'name'}: $newValue})
      MERGE (u)-[:${relType}]->(n)
      RETURN u, n
    `;
    const result = await session.run(query, { userId, newValue });
    return result.records[0]?.get('n').properties;
  } finally {
    await session.close();
  }
};

const updateListRel = async (userId, relType, nodeLabel, items) => {
  const session = getSession();
  try {
    const query = `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[r:${relType}]->()
      DELETE r
      WITH u
      UNWIND $items AS itemName
      MERGE (n:${nodeLabel} {name: itemName})
      MERGE (u)-[:${relType}]->(n)
      RETURN u
    `;
    await session.run(query, { userId, items });
    return true;
  } finally {
    await session.close();
  }
};

module.exports = { updateProfile, updateAcademic, updateListRel };

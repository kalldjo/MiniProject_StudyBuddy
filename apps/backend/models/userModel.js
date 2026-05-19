const { getSession } = require('../config/neo4j');

const updateProfile = async (userId, name, bio, profilePicture, fakultas, jurusan, angkatan) => {
  const session = getSession();
  try {
    const query = `
      MATCH (u:User {id: $userId})
      SET u.name = $name, u.bio = $bio, u.profilePicture = $profilePicture
      
      WITH u
      OPTIONAL MATCH (u)-[oldJ:MAJORS_IN]->(:Jurusan)
      DELETE oldJ
      WITH u
      FOREACH (ignoreMe IN CASE WHEN $jurusan <> "" AND $jurusan IS NOT NULL THEN [1] ELSE [] END |
        MERGE (newJ:Jurusan {name: $jurusan})
        MERGE (u)-[:MAJORS_IN]->(newJ)
      )

      WITH u
      OPTIONAL MATCH (u)-[oldF:BELONGS_TO_FAKULTAS]->(:Fakultas)
      DELETE oldF
      WITH u
      FOREACH (ignoreMe IN CASE WHEN $fakultas <> "" AND $fakultas IS NOT NULL THEN [1] ELSE [] END |
        MERGE (newF:Fakultas {name: $fakultas})
        MERGE (u)-[:BELONGS_TO_FAKULTAS]->(newF)
      )

      WITH u
      OPTIONAL MATCH (u)-[oldA:CLASS_OF]->(:Angkatan)
      DELETE oldA
      WITH u
      FOREACH (ignoreMe IN CASE WHEN $angkatan <> "" AND $angkatan IS NOT NULL THEN [1] ELSE [] END |
        MERGE (newA:Angkatan {year: $angkatan})
        MERGE (u)-[:CLASS_OF]->(newA)
      )

      WITH u
      OPTIONAL MATCH (u)-[:MAJORS_IN]->(j:Jurusan)
      OPTIONAL MATCH (u)-[:BELONGS_TO_FAKULTAS]->(f:Fakultas)
      OPTIONAL MATCH (u)-[:CLASS_OF]->(a:Angkatan)
      RETURN u { .*, jurusan: j.name, fakultas: f.name, angkatan: a.year } AS u
    `;
    const result = await session.run(query, { userId, name, bio, profilePicture, fakultas: fakultas || '', jurusan: jurusan || '', angkatan: angkatan || '' });
    return result.records[0]?.get('u');
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

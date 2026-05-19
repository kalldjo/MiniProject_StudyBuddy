const { getSession } = require('../config/neo4j');

const searchByFilters = async (fakultas, jurusan, angkatan) => {
  const session = getSession();
  try {
    let query = 'MATCH (u:User) ';
    let conditions = [];
    let params = {};

    if (fakultas) {
      query += '-[:BELONGS_TO_FAKULTAS]->(f:Fakultas) ';
      conditions.push('f.name = $fakultas');
      params.fakultas = fakultas;
    }
    if (jurusan) {
      query += 'MATCH (u)-[:MAJORS_IN]->(j:Jurusan) ';
      conditions.push('j.name = $jurusan');
      params.jurusan = jurusan;
    }
    if (angkatan) {
      query += 'MATCH (u)-[:CLASS_OF]->(a:Angkatan) ';
      conditions.push('a.year = $angkatan');
      params.angkatan = angkatan;
    }

    if (conditions.length > 0) {
      query += 'WHERE ' + conditions.join(' AND ') + ' ';
    }
    
    query += 'RETURN u';
    
    const result = await session.run(query, params);
    return result.records.map(record => record.get('u').properties);
  } finally {
    await session.close();
  }
};

const recommendByInterest = async (userId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:INTERESTED_IN]->(i:Interest)<-[:INTERESTED_IN]-(other:User)
      RETURN other, count(i) AS mutualInterests
      ORDER BY mutualInterests DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => ({
      user: record.get('other').properties,
      mutualInterests: record.get('mutualInterests').toNumber()
    }));
  } finally {
    await session.close();
  }
};

const recommendByProjectSkills = async (userId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:WORKING_ON]->(p:Project)-[:REQUIRES_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:User)
      RETURN other, collect(s.name) AS matchingSkills
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => ({
      user: record.get('other').properties,
      matchingSkills: record.get('matchingSkills')
    }));
  } finally {
    await session.close();
  }
};

const recommendBySocialProximity = async (userId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:IS_FRIENDS_WITH*2]-(other:User)
      WHERE other.id <> $userId AND NOT (me)-[:IS_FRIENDS_WITH]-(other)
      OPTIONAL MATCH (other)-[:MAJORS_IN]->(j:Jurusan)<-[:MAJORS_IN]-(me)
      OPTIONAL MATCH (other)-[:CLASS_OF]->(a:Angkatan)<-[:CLASS_OF]-(me)
      WITH other, count(j) AS sameJurusan, count(a) AS sameAngkatan
      RETURN other, (1 + sameJurusan*2 + sameAngkatan*2) AS weight
      ORDER BY weight DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => ({
      user: record.get('other').properties,
      weight: record.get('weight').toNumber()
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  searchByFilters,
  recommendByInterest,
  recommendByProjectSkills,
  recommendBySocialProximity
};

const { driver } = require('../neo4j');

// 1. Search by Filters
const searchByFilters = async (req, res) => {
  const { fakultas, jurusan, angkatan } = req.query;
  const session = driver.session();
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
    const users = result.records.map(record => record.get('u').properties);
    res.json({ data: users });
  } catch (error) {
    // handle error if db fails
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// 2. Recommendations by Interest of Fields
const recommendByInterest = async (req, res) => {
  const { userId } = req.query;
  const session = driver.session();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:INTERESTED_IN]->(i:Interest)<-[:INTERESTED_IN]-(other:User)
      RETURN other, count(i) AS mutualInterests
      ORDER BY mutualInterests DESC
    `;
    const result = await session.run(query, { userId });
    const data = result.records.map(record => ({
      user: record.get('other').properties,
      mutualInterests: record.get('mutualInterests').toNumber()
    }));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// 3. Recommendations by Project Skills Match
const recommendByProjectSkills = async (req, res) => {
  const { userId } = req.query;
  const session = driver.session();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:WORKING_ON]->(p:Project)-[:REQUIRES_SKILL]->(s:Skill)<-[:HAS_SKILL]-(other:User)
      RETURN other, collect(s.name) AS matchingSkills
    `;
    const result = await session.run(query, { userId });
    const data = result.records.map(record => ({
      user: record.get('other').properties,
      matchingSkills: record.get('matchingSkills')
    }));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// 4. Recommendations by Social Graph & Demographics
const recommendBySocialProximity = async (req, res) => {
  const { userId } = req.query;
  const session = driver.session();
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
    const data = result.records.map(record => ({
      user: record.get('other').properties,
      weight: record.get('weight').toNumber()
    }));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

const { getSession } = require('../config/neo4j');

const searchByFilters = async (fakultas, jurusan, angkatan) => {
  const session = getSession();
  try {
    const query = `
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:MAJORS_IN]->(j:Jurusan)
      OPTIONAL MATCH (u)-[:BELONGS_TO_FAKULTAS]->(f:Fakultas)
      OPTIONAL MATCH (u)-[:CLASS_OF]->(a:Angkatan)
      WHERE 
        ($jurusan = 'Semua' OR $jurusan = '' OR $jurusan IS NULL OR toLower(j.name) CONTAINS toLower($jurusan))
        AND ($fakultas = 'Semua' OR $fakultas = '' OR $fakultas IS NULL OR toLower(f.name) CONTAINS toLower($fakultas))
        AND ($angkatan = 'Semua' OR $angkatan = '' OR $angkatan IS NULL OR toLower(toString(a.year)) CONTAINS toLower(toString($angkatan)))
      RETURN u {
        .*, 
        jurusan: j.name, 
        fakultas: f.name, 
        angkatan: a.year
      } AS u
    `;
    
    const params = {
      fakultas: fakultas || null,
      jurusan: jurusan || null,
      angkatan: angkatan || null
    };
    
    const result = await session.run(query, params);
    return result.records.map(record => {
      const u = record.get('u');
      if (u) delete u.passwordHash;
      return u;
    });
  } finally {
    await session.close();
  }
};

const recommendByInterest = async (userId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:INTERESTED_IN]->(myInt:Interest)
      MATCH (other:User)-[:INTERESTED_IN]->(otherInt:Interest)
      WHERE me.id <> other.id AND toLower(myInt.name) = toLower(otherInt.name)
      OPTIONAL MATCH (other)-[:MAJORS_IN]->(j:Jurusan)
      OPTIONAL MATCH (other)-[:BELONGS_TO_FAKULTAS]->(f:Fakultas)
      OPTIONAL MATCH (other)-[:CLASS_OF]->(a:Angkatan)
      RETURN other { .*, jurusan: j.name, fakultas: f.name, angkatan: a.year } AS other, count(otherInt) AS mutualInterests
      ORDER BY mutualInterests DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => {
      const user = record.get('other');
      if (user) delete user.passwordHash;
      return {
        user,
        mutualInterests: record.get('mutualInterests').toNumber()
      };
    });
  } finally {
    await session.close();
  }
};

const recommendBySkills = async (userId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (me:User {id: $userId})-[:HAS_SKILL]->(mySkill:Skill)
      MATCH (other:User)-[:HAS_SKILL]->(otherSkill:Skill)
      WHERE me.id <> other.id AND toLower(mySkill.name) = toLower(otherSkill.name)
      OPTIONAL MATCH (other)-[:MAJORS_IN]->(j:Jurusan)
      OPTIONAL MATCH (other)-[:BELONGS_TO_FAKULTAS]->(f:Fakultas)
      OPTIONAL MATCH (other)-[:CLASS_OF]->(a:Angkatan)
      RETURN other { 
        .*, 
        jurusan: j.name, 
        fakultas: f.name, 
        angkatan: a.year 
      } AS other, count(otherSkill) AS mutualSkillsCount
      ORDER BY mutualSkillsCount DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => {
      const user = record.get('other');
      if (user) delete user.passwordHash;
      return {
        user,
        mutualSkillsCount: record.get('mutualSkillsCount').toNumber()
      };
    });
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
      OPTIONAL MATCH (other)-[:MAJORS_IN]->(sharedJ:Jurusan)<-[:MAJORS_IN]-(me)
      OPTIONAL MATCH (other)-[:CLASS_OF]->(sharedA:Angkatan)<-[:CLASS_OF]-(me)
      WITH other, count(sharedJ) AS sameJurusan, count(sharedA) AS sameAngkatan
      OPTIONAL MATCH (other)-[:MAJORS_IN]->(j:Jurusan)
      OPTIONAL MATCH (other)-[:BELONGS_TO_FAKULTAS]->(f:Fakultas)
      OPTIONAL MATCH (other)-[:CLASS_OF]->(a:Angkatan)
      RETURN other { .*, jurusan: j.name, fakultas: f.name, angkatan: a.year } AS other, (1 + sameJurusan*2 + sameAngkatan*2) AS weight
      ORDER BY weight DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => {
      const user = record.get('other');
      if (user) delete user.passwordHash;
      return {
        user,
        weight: record.get('weight').toNumber()
      };
    });
  } finally {
    await session.close();
  }
};

module.exports = {
  searchByFilters,
  recommendByInterest,
  recommendBySkills,
  recommendBySocialProximity
};

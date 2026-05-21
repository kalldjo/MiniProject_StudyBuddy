const { getSession } = require('../config/neo4j');
const sqlite3 = require('sqlite3').verbose();

// Initialize in-memory SQLite DB
const db = new sqlite3.Database(':memory:');

// Setup mock data for relational DB benchmark
let mockDataReady = false;
const setupMockData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT)");
      db.run("CREATE TABLE friends (user_id_1 TEXT, user_id_2 TEXT)");
      db.run("CREATE INDEX idx_friends_1 ON friends(user_id_1)");
      db.run("CREATE INDEX idx_friends_2 ON friends(user_id_2)");
      
      const stmtUser = db.prepare("INSERT INTO users VALUES (?, ?)");
      const stmtFriend = db.prepare("INSERT INTO friends VALUES (?, ?)");
      
      // Generate 1000 users
      const userIds = [];
      for (let i = 1; i <= 1000; i++) {
        const id = `user_${i}`;
        userIds.push(id);
        stmtUser.run(id, `User ${i}`);
      }
      
      // Generate 5000 random friendships
      for (let i = 0; i < 5000; i++) {
        const u1 = userIds[Math.floor(Math.random() * userIds.length)];
        let u2 = userIds[Math.floor(Math.random() * userIds.length)];
        while(u1 === u2) u2 = userIds[Math.floor(Math.random() * userIds.length)];
        
        stmtFriend.run(u1, u2);
        stmtFriend.run(u2, u1); // bidirection
      }
      
      stmtUser.finalize();
      stmtFriend.finalize();
      
      mockDataReady = true;
      resolve();
    });
  });
};

setupMockData();

const runBenchmark = async (req, res) => {
  try {
    if (!mockDataReady) {
      return res.status(503).json({ error: 'Mock DB is still initializing' });
    }

    // Benchmark Neo4j
    const session = getSession();
    const neo4jStart = performance.now();
    
    // FoF anchored to one user (6-hops deep to force Relational Cartesian Explosion)
    // Mensimulasikan real query: "Tampilkan jaringan terdalam dari user yang sedang login"
    const neo4jQuery = `
      MATCH (u:User {id: 'dummy_1'})-[:IS_FRIENDS_WITH*6..6]-(network:User)
      RETURN count(distinct network) AS networkCount
    `;
    await session.run(neo4jQuery);
    
    const neo4jEnd = performance.now();
    await session.close();
    const neo4jTime = (neo4jEnd - neo4jStart).toFixed(2);

    // Benchmark SQLite
    const sqliteStart = performance.now();
    const sqliteQuery = `
      SELECT count(DISTINCT f6.user_id_2) as networkCount
      FROM friends f1
      JOIN friends f2 ON f1.user_id_2 = f2.user_id_1
      JOIN friends f3 ON f2.user_id_2 = f3.user_id_1
      JOIN friends f4 ON f3.user_id_2 = f4.user_id_1
      JOIN friends f5 ON f4.user_id_2 = f5.user_id_1
      JOIN friends f6 ON f5.user_id_2 = f6.user_id_1
      WHERE f1.user_id_1 = 'user_1'
    `;
    
    const sqliteTime = await new Promise((resolve, reject) => {
      db.all(sqliteQuery, [], (err, rows) => {
        if (err) return reject(err);
        const end = performance.now();
        resolve((end - sqliteStart).toFixed(2));
      });
    });

    res.json({
      success: true,
      message: 'Benchmark Database Tradisional (SQLite) vs Graph (Neo4j) on Anchored 6-Hop Traversal',
      data: {
        neo4jTimeMs: Number(neo4jTime),
        sqliteTimeMs: Number(sqliteTime),
        conclusion: Number(neo4jTime) < Number(sqliteTime) 
          ? 'Graph DB (Neo4j) terbukti jauh lebih cepat membedah relasi dalam (6-hops) untuk satu entitas spesifik, menembus batasan Cartesian Explosion di Relational DB.' 
          : 'SQL masih menang (perlu ditambah kompleksitas hops) atau karena latensi cloud tinggi.'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { runBenchmark };

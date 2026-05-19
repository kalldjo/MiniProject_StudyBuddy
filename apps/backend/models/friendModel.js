const { getSession } = require('../config/neo4j');

const addFriendRequest = async (userId, targetId) => {
  const session = getSession();
  try {
    const query = `
      MERGE (a:User {id: $userId})
      MERGE (b:User {id: $targetId})
      MERGE (a)-[r:HAS_PENDING_REQUEST]->(b)
      RETURN r
    `;
    await session.run(query, { userId, targetId });
    return true;
  } finally {
    await session.close();
  }
};

const acceptFriendRequest = async (userId, targetId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (target:User {id: $targetId})-[req:HAS_PENDING_REQUEST]->(me:User {id: $userId})
      DELETE req
      WITH target, me
      MERGE (me)-[:IS_FRIENDS_WITH]->(target)
      MERGE (target)-[:IS_FRIENDS_WITH]->(me)
      RETURN target
    `;
    const result = await session.run(query, { userId, targetId });
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

const rejectFriendRequest = async (userId, targetId) => {
  const session = getSession();
  try {
    const query = `
      MATCH (target:User {id: $targetId})-[req:HAS_PENDING_REQUEST]->(me:User {id: $userId})
      DELETE req
    `;
    await session.run(query, { userId, targetId });
    return true;
  } finally {
    await session.close();
  }
};

module.exports = { addFriendRequest, acceptFriendRequest, rejectFriendRequest };

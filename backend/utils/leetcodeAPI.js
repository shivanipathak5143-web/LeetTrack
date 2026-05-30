import { query } from "express-validator";

const LEETCODE_API="https://leetcode.com/graphql";

const fetchLeetCode=async(query,variables={})=>{
    const res=await fetch(LEETCODE_API,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            Referer:'https://leetcode.com',
        },
        body:JSON.stringify({
            query,
            variables
        })
    });
    if(!res.ok){
        throw new Error(`LeetCode API error: ${res.status} ${res.statusText}`);
    }
    const json=await res.json();
    if(json.errors){
        throw new Error(`LeetCode API error: ${json.errors.map(e=>e.message).join(', ')}`);
    }
    return json.data;
};

export const fetchUserStats=async(username)=>{
    const query=`query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          starRating
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        tagProblemCounts {
          advanced { tagName tagSlug problemsSolved }
          intermediate { tagName tagSlug problemsSolved }
          fundamental { tagName tagSlug problemsSolved }
        }
        userCalendar {
          streak
          totalActiveDays
          submissionCalendar
        }
      }
    }
  `;

  const data = await fetchLeetCode(query, { username });
 
  if (!data.matchedUser) {
    throw new Error(`LeetCode user "${username}" not found`);
  }
 
  const user = data.matchedUser;
  const acStats = user.submitStats?.acSubmissionNum || [];
 
  const getCount = (difficulty) =>
    acStats.find((s) => s.difficulty === difficulty)?.count || 0;
 
  const getSubmissions = (difficulty) =>
    acStats.find((s) => s.difficulty === difficulty)?.submissions || 0;
 
  const totalSolved = getCount("All");
  const totalSubmissions = getSubmissions("All");
 
  // Flatten topic breakdown
  const allTopics = [
    ...(user.tagProblemCounts?.advanced || []),
    ...(user.tagProblemCounts?.intermediate || []),
    ...(user.tagProblemCounts?.fundamental || []),
  ];
 
  const topicBreakdown = allTopics
    .filter((t) => t.problemsSolved > 0)
    .map((t) => ({ topic: t.tagName, solved: t.problemsSolved }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 20); // top 20 topics
 
  return {
    totalSolved,
    easySolved: getCount("Easy"),
    mediumSolved: getCount("Medium"),
    hardSolved: getCount("Hard"),
    totalSubmissions,
    acceptanceRate:
      totalSubmissions > 0
        ? Math.round((totalSolved / totalSubmissions) * 100 * 10) / 10
        : 0,
    ranking: user.profile?.ranking || 0,
    streak: user.userCalendar?.streak || 0,
    totalActiveDays: user.userCalendar?.totalActiveDays || 0,
    submissionCalendar: user.userCalendar?.submissionCalendar || "{}",
    topicBreakdown,
    lastFetched: new Date(),
  };
};
 
// ── FETCH RECENT SUBMISSIONS ──────────────────────────────
export const fetchRecentSubmissions = async (username, limit = 20) => {
  const query = `
    query getRecentSubmissions($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
        runtime
        memory
      }
    }
  `;
 
  const data = await fetchLeetCode(query, { username, limit });
  return data.recentSubmissionList || [];  
};


export const fetchProblemDetails = async (titleSlug) => {
  const query = `
    query getProblem($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        acRate
        isPaidOnly
        topicTags { name slug }
        stats
      }
    }
  `;
 
  const data = await fetchLeetCode(query, { titleSlug });
  return data.question || null;
};

export const fetchProblemList = async (skip = 0, limit = 50, filters = {}) => {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        total: totalNum
        questions: data {
          questionId
          title
          titleSlug
          difficulty
          acRate
          isPaidOnly
          topicTags { name slug }
        }
      }
    }
  `;
 
  const data = await fetchLeetCode(query, {
    categorySlug: "",
    limit,
    skip,
    filters,
  });
 
  return data.problemsetQuestionList || { total: 0, questions: [] };
};


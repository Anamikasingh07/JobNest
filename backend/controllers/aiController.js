const User = require('../models/User');
const Job = require('../models/Job');

let genAiClientPromise;
const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.');
  if (!genAiClientPromise) {
    genAiClientPromise = import('@google/genai')
      .then(({ GoogleGenAI }) => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));
  }
  return genAiClientPromise;
};

const callGemini = async (prompt) => {
  const ai = await getAiClient();
  let result;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 1800,
          httpOptions: { timeout: 60000 }
        }
      });
      break;
    } catch (error) {
      const message = error.message || '';
      const unavailable = Number(error.status) === 503 || /\b503\b|unavailable|high demand/i.test(message);
      if (!unavailable || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }
  const responseText = result.text || '';
  try {
    return JSON.parse(responseText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim());
  } catch {
    throw new Error('Gemini returned an unreadable response. Please try again.');
  }
};

const getCandidateProfile = async (userId) => User.findById(userId)
  .select('name headline location about skills experience education');

const sendAiError = (res, error) => {
  const message = error.message || 'The AI request failed.';
  console.error('Gemini request failed:', error.status || error.code || '', message);
  if (/quota|rate|resource_exhausted|429/i.test(message)) {
    return res.status(429).json({ message: 'Gemini is temporarily at its usage limit. Please wait and try again.' });
  }
  if (/GEMINI_API_KEY/.test(message)) return res.status(503).json({ message });
  if (Number(error.status) === 503 || /\b503\b|unavailable|high demand/i.test(message)) {
    return res.status(503).json({ message: 'Gemini is temporarily overloaded. Please wait a moment, then try the resume review again.' });
  }
  if (/timeout|timed out|abort|deadline_exceeded/i.test(message) || error.code === 'ETIMEDOUT' || Number(error.status) === 504) {
    return res.status(504).json({ message: 'Gemini took too long to respond. Please try again.' });
  }
  if ([400, 401, 403, 404].includes(Number(error.status))) {
    return res.status(502).json({ message: `Gemini rejected the request (${error.status}): ${message.slice(0, 240)}` });
  }
  return res.status(502).json({ message: `Gemini could not complete the request: ${message.slice(0, 240)}` });
};

exports.generateInterviewPrep = async (req, res) => {
  try {
    const { title, company, description, skills } = req.body || {};
    if (!String(title || description || '').trim()) return res.status(400).json({ message: 'Choose a job or provide a job title or description.' });
    const profile = await getCandidateProfile(req.user._id);
    const result = await callGemini(`You are a practical interview coach. Return only valid JSON with shape {"questions":[{"id":"q1","category":"Technical|Behavioral|Company","question":"..."}],"topics":["..."]}. Generate 8 likely questions: 4 technical, 3 behavioral, and 1 company question. Generate 4-8 concise revision topics based on the actual requirements. Do not invent company facts. Job title: ${String(title || '').slice(0, 180)}. Company: ${String(company || '').slice(0, 180)}. Required skills: ${JSON.stringify(Array.isArray(skills) ? skills.slice(0, 30) : [])}. Description: ${String(description || '').slice(0, 8000)}. Candidate profile context: ${JSON.stringify({ headline: profile?.headline, skills: profile?.skills, experience: profile?.experience, about: profile?.about }).slice(0, 5000)}`);
    return res.json({ ...result, generatedBy: 'Gemini' });
  } catch (error) { return sendAiError(res, error); }
};

exports.reviewPracticeAnswer = async (req, res) => {
  try {
    const { question, category, answer, jobTitle, skills } = req.body || {};
    if (!String(question || '').trim() || !String(answer || '').trim()) return res.status(400).json({ message: 'Provide the interview question and your answer.' });
    const result = await callGemini(`You are a supportive interview coach. Give specific, constructive feedback on the candidate's answer. Return only JSON: {"feedback":[{"label":"Clarity|Structure|Specificity|Role relevance|STAR structure","text":"..."}]}. Give 3-5 concise, actionable feedback items. Never write a replacement answer for them. If behavioral, assess Situation, Task, Action, Result and suggest missing pieces. Question: ${String(question).slice(0, 1500)}. Category: ${String(category || '').slice(0, 40)}. Job: ${String(jobTitle || '').slice(0, 180)}. Required skills: ${JSON.stringify(Array.isArray(skills) ? skills.slice(0, 30) : [])}. Candidate answer: ${String(answer).slice(0, 6000)}`);
    return res.json({ ...result, generatedBy: 'Gemini' });
  } catch (error) { return sendAiError(res, error); }
};

exports.reviewResume = async (req, res) => {
  try {
    const resumeText = String(req.body?.resumeText || '').trim();
    if (!resumeText) return res.status(400).json({ message: 'Provide extracted resume text to review.' });
    if (resumeText.length > 24000) return res.status(413).json({ message: 'Resume text is too long to review. Keep it under 24,000 characters.' });
    const result = await callGemini(`Review this resume and return only JSON: {"actions":[{"title":"...","detail":"...","priority":"High|Medium|Low"}]}. Give 4-8 specific checklist actions based only on the resume. Check weak or vague bullets, missing measurable results, spelling/grammar, section clarity and length. Quote short phrases from the resume when useful. Do not invent experience or claim something is missing if it is present. Do not give a score, hiring prediction, or rewrite the whole resume. Resume text:\n${resumeText}`);
    return res.json({ ...result, generatedBy: 'Gemini' });
  } catch (error) { return sendAiError(res, error); }
};

exports.matchCandidateToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).select('title companyName description skills experienceLevel');
    if (!job) return res.status(404).json({ message: 'Job posting not found.' });
    const profile = await User.findById(req.user._id).select('headline about skills experience education');
    const requiredSkills = Array.isArray(job.skills) ? job.skills : [];
    const candidateSkills = Array.isArray(profile?.skills) ? profile.skills : [];
    const normalize = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
    const candidateSet = new Set(candidateSkills.map(normalize));
    const matchedSkills = requiredSkills.filter((skill) => candidateSet.has(normalize(skill)));
    const missingSkills = requiredSkills.filter((skill) => !candidateSet.has(normalize(skill)));
    if (!requiredSkills.length) return res.json({ matchedSkills, missingSkills, score: null, rationale: 'The recruiter has not listed required skills for this job.', generatedBy: 'Gemini' });
    const result = await callGemini(`Assess job-profile alignment, not the chance of being hired. Return only JSON: {"score":number,"rationale":"...","standout":"...","improve":"..."}. Score must be an integer from 0 to 100, based only on the listed skills and relevant experience/profile evidence. Be conservative when evidence is limited. Explain briefly that this is an estimate, not a hiring prediction. Job: ${JSON.stringify({ title: job.title, description: job.description, skills: requiredSkills, experienceLevel: job.experienceLevel }).slice(0, 7000)}. Candidate profile (do not infer facts not present): ${JSON.stringify({ headline: profile?.headline, about: profile?.about, skills: candidateSkills, experience: profile?.experience, education: profile?.education }).slice(0, 6000)}. Deterministic listed-skill overlap: ${matchedSkills.length} of ${requiredSkills.length} listed skills match.`);
    const score = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
    return res.json({ matchedSkills, missingSkills, score, rationale: result.rationale || '', standout: result.standout || '', improve: result.improve || '', generatedBy: 'Gemini' });
  } catch (error) { return sendAiError(res, error); }
};

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/applicationService';
import './AIPage.css';

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const SUPPORTED_RESUME_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'bmp'];

const getRealResumeType = (bytes) => {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) return 'pdf';
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)) return 'png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'webp';
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'bmp';
  return '';
};

const extractPdfText = async (file, worker, setOcrStatus, pdfjsLib) => {
  // PDF.js exposes destroy() on the loading task, not on PDFDocumentProxy.
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pages = [];
  try {
    const pdf = await loadingTask.promise;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setOcrStatus(`Reading PDF page ${pageNumber} of ${pdf.numPages}...`);
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const selectableText = textContent.items.map((item) => item.str || '').join(' ').trim();
      if (selectableText.length > 30) {
        pages.push(selectableText);
        continue;
      }

      setOcrStatus(`Running OCR on PDF page ${pageNumber} of ${pdf.numPages}...`);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;
      const { data } = await worker.recognize(canvas);
      pages.push(data.text.trim());
      canvas.width = 0;
      canvas.height = 0;
    }
    return pages.filter(Boolean).join('\n\n');
  } finally {
    await loadingTask.destroy();
  }
};

const extractResumeText = async (file, realType, setOcrStatus, setOcrProgress) => {
  const [tesseractModule, pdfjsLib, pdfWorkerModule, tesseractWorkerModule] = await Promise.all([
    import('tesseract.js'),
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    import('tesseract.js/dist/worker.min.js?url')
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerModule.default;
  const worker = await tesseractModule.createWorker('eng', 1, {
    workerPath: tesseractWorkerModule.default,
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v7.0.0',
    langPath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int',
    logger: (message) => {
      if (message.status) setOcrStatus(message.status === 'recognizing text' ? 'Recognizing text...' : 'Preparing OCR...');
      if (Number.isFinite(message.progress)) setOcrProgress(Math.round(message.progress * 100));
    }
  });
  try {
    if (realType === 'pdf') return await extractPdfText(file, worker, setOcrStatus, pdfjsLib);
    setOcrStatus('Recognizing resume image...');
    const { data } = await worker.recognize(file);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
};

const typoSuggestions = [
  ['teh', 'the'], ['recieved', 'received'], ['experiance', 'experience'],
  ['responsiblities', 'responsibilities'], ['managment', 'management'],
  ['develope', 'develop'], ['enviroment', 'environment'], ['manger', 'manager']
];

const makeResumeChecklist = (resumeText) => {
  const text = resumeText.trim();
  if (!text) return [];

  const bullets = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[•*-]\s+/.test(line));
  const weakBullets = bullets.filter((line) => {
    const words = line.replace(/^[•*-]\s+/, '').split(/\s+/).filter(Boolean);
    return words.length < 9 || /^(responsible for|helped|worked on|assisted with)\b/i.test(line.replace(/^[•*-]\s+/, ''));
  });
  const misspellings = typoSuggestions.filter(([incorrect]) => new RegExp(`\\b${incorrect}\\b`, 'i').test(text));
  const headings = text.split(/\r?\n/).filter((line) => /^[A-Z][A-Z &/]{2,}$/.test(line.trim()));
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sectionBlocks = text.split(/\r?\n(?=[A-Z][A-Z &/]{2,}\s*$)/m).filter(Boolean);
  const longSections = sectionBlocks.filter((section) => section.split(/\s+/).filter(Boolean).length > 220);

  return [
    {
      id: 'bullets',
      title: 'Make experience bullets more specific',
      needsAttention: weakBullets.length > 0,
      detail: weakBullets.length
        ? `${weakBullets.length} bullet${weakBullets.length === 1 ? '' : 's'} may be too brief or start with a vague phrase. Lead with an action verb and explain the result.`
        : bullets.length ? 'Your bullets have useful detail. Check that each one explains your action and its result.' : 'No bulleted experience was detected. Add concise bullets describing your work and achievements.'
    },
    {
      id: 'numbers',
      title: 'Add measurable results',
      needsAttention: bullets.length === 0 || !bullets.some((line) => /\d/.test(line)),
      detail: bullets.some((line) => /\d/.test(line))
        ? 'At least one bullet includes a number. Add metrics to other achievements where possible.'
        : 'No numbers were found in your bullets. Add counts, time saved, growth, scale, or other measurable outcomes where accurate.'
    },
    {
      id: 'spelling',
      title: 'Check possible spelling mistakes',
      needsAttention: misspellings.length > 0,
      detail: misspellings.length
        ? `Review: ${misspellings.map(([incorrect, correct]) => `${incorrect} → ${correct}`).join(', ')}.`
        : 'No common spelling issues were detected. Run a final spelling check before sending.'
    },
    {
      id: 'sections',
      title: 'Keep sections focused',
      needsAttention: longSections.length > 0 || wordCount > 900 || headings.length < 3,
      detail: longSections.length
        ? 'One or more sections look lengthy. Keep each section focused on the most relevant experience and results.'
        : wordCount > 900
          ? `The resume is about ${wordCount} words. Consider trimming repeated or less relevant details.`
          : headings.length < 3
            ? 'Few standard section headings were detected. Use clear headings such as EXPERIENCE, EDUCATION, and SKILLS.'
            : 'Your resume length looks reasonable. Keep each section focused and easy to scan.'
    }
  ];
};

const AIPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('interview');
  const [jobTitle, setJobTitle] = useState(location.state?.jobTitle || '');
  const [companyName, setCompanyName] = useState(location.state?.companyName || '');
  const [jobDescription, setJobDescription] = useState(location.state?.jobDescription || '');
  const [requiredSkills, setRequiredSkills] = useState((Array.isArray(location.state?.skills) ? location.state.skills : []).join(', '));
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [star, setStar] = useState({ situation: '', task: '', action: '', result: '' });
  const [resumeText, setResumeText] = useState('');
  const [reviewRequested, setReviewRequested] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrError, setOcrError] = useState('');

  useEffect(() => {
    API.get('/jobs').then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setAvailableJobs(list);
      const initialJob = list.find((job) => String(job._id) === String(location.state?.jobId || ''));
      if (initialJob) setSelectedJobId(String(initialJob._id));
    }).catch(() => setAvailableJobs([]));
  }, [location.state]);

  const skills = useMemo(() => {
    return [...new Set(requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean))];
  }, [requiredSkills]);

  const questions = useMemo(() => {
    if (!jobTitle.trim() && !jobDescription.trim()) return [];
    const title = jobTitle.trim() || 'this role';
    const company = companyName.trim() || 'the company';
    return [
      ...skills.slice(0, 5).map((skill, index) => ({
        id: `technical-${index}`,
        category: 'Technical',
        question: `How have you used ${skill} to solve a challenging problem? What approach did you take, and what was the result?`
      })),
      {
        id: 'technical-role', category: 'Technical',
        question: `What would you prioritize in your first project as a ${title}, and how would you measure whether it succeeded?`
      },
      {
        id: 'behavioral-team', category: 'Behavioral',
        question: 'Tell me about a time you had to work through a difficult challenge with a team.'
      },
      {
        id: 'behavioral-impact', category: 'Behavioral',
        question: 'Describe an achievement you are proud of and the impact your contribution had.'
      },
      {
        id: 'company', category: 'Company',
        question: `Why are you interested in working at ${company}, and what would you contribute in this role?`
      }
    ];
  }, [skills, jobTitle, companyName, jobDescription]);

  const resumeChecklist = useMemo(() => makeResumeChecklist(resumeText), [resumeText]);
  const feedback = useMemo(() => {
    if (!selectedQuestion || !answer.trim()) return [];
    const words = answer.trim().split(/\s+/).filter(Boolean);
    const sentences = answer.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0);
    const items = [];
    items.push(words.length >= 45
      ? { label: 'Detail', text: 'Your answer has enough detail to explain your thinking.' }
      : { label: 'Add detail', text: 'Expand your answer with a specific example and the outcome. Aim for a few complete sentences.' });
    items.push(sentences.length >= 2
      ? { label: 'Clarity', text: 'Your answer is split into clear thoughts. Remove repeated details if it feels long.' }
      : { label: 'Clarity', text: 'Use short, complete sentences so the interviewer can follow your point.' });
    if (selectedQuestion.category === 'Behavioral') {
      const present = ['situation', 'task', 'action', 'result'].filter((part) =>
        new RegExp(`\\b${part}\\b`, 'i').test(answer) || Boolean(star[part].trim())
      );
      items.push(present.length === 4
        ? { label: 'STAR structure', text: 'Your answer covers Situation, Task, Action, and Result.' }
        : { label: 'STAR structure', text: `Add the missing STAR parts: ${['situation', 'task', 'action', 'result'].filter((part) => !present.includes(part)).map((part) => part[0].toUpperCase() + part.slice(1)).join(', ')}.` });
    }
    if (skills.length && !skills.some((skill) => answer.toLowerCase().includes(skill.toLowerCase()))) {
      items.push({ label: 'Role relevance', text: 'Connect your example to one of the job’s required skills where it fits.' });
    }
    return items;
  }, [answer, selectedQuestion, skills, star]);

  const selectQuestion = (question) => {
    setSelectedQuestion(question);
    setAnswer('');
    setStar({ situation: '', task: '', action: '', result: '' });
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setOcrError('');
    setResumeText('');
    setReviewRequested(false);
    setOcrProgress(0);

    if (file.size > MAX_RESUME_BYTES) {
      setOcrError('Resume must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!SUPPORTED_RESUME_EXTENSIONS.includes(extension)) {
      setOcrError('Upload a PDF or image file (PNG, JPG, WEBP, or BMP).');
      event.target.value = '';
      return;
    }

    try {
      const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const realType = getRealResumeType(header);
      const extensionType = extension === 'jpeg' ? 'jpg' : extension;
      if (!realType || realType !== extensionType) {
        setOcrError('The file content does not match its file type. Choose a valid PDF or image file.');
        event.target.value = '';
        return;
      }
      const expectedMimeTypes = {
        pdf: ['application/pdf'], png: ['image/png'], jpg: ['image/jpeg'],
        webp: ['image/webp'], bmp: ['image/bmp', 'image/x-ms-bmp']
      }[realType];
      if (file.type && file.type !== 'application/octet-stream' && !expectedMimeTypes.includes(file.type)) {
        setOcrError('This file type is not supported. Upload a PDF or a supported image.');
        event.target.value = '';
        return;
      }

      setOcrLoading(true);
      setOcrStatus('Starting OCR...');
      const extractedText = await extractResumeText(file, realType, setOcrStatus, setOcrProgress);
      if (!extractedText.trim()) {
        setOcrError('No readable text was found. Try a clearer scan or paste the resume text below.');
        setOcrStatus('');
        return;
      }
      setResumeText(extractedText);
      setReviewRequested(true);
      setOcrStatus('Resume text extracted. Review the text below and edit any OCR mistakes.');
    } catch (error) {
      setOcrError(error.message || 'Could not read this resume. Try another file or paste the text below.');
      setOcrStatus('');
    } finally {
      setOcrLoading(false);
    }
  };

  const updateStar = (field, value) => {
    const next = { ...star, [field]: value };
    setStar(next);
    setAnswer(['situation', 'task', 'action', 'result']
      .filter((part) => next[part].trim())
      .map((part) => `${part[0].toUpperCase() + part.slice(1)}: ${next[part].trim()}`)
      .join('\n\n'));
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    const job = availableJobs.find((item) => String(item._id) === jobId);
    if (!job) return;
    setJobTitle(job.title || '');
    setCompanyName(job.companyName || job.company || '');
    setJobDescription(job.description || '');
    setRequiredSkills(Array.isArray(job.skills) ? job.skills.join(', ') : '');
    setSelectedQuestion(null);
    setAnswer('');
  };

  return (
    <main className="ai-assistant-page">
      <header className="ai-assistant-header">
        <div>
          <p className="ai-assistant-eyebrow">JOBNEST CAREER TOOLS</p>
          <h1>AI Assistant</h1>
          <p>Prepare for interviews and get practical fixes for your resume.</p>
        </div>
        <div className="ai-assistant-tabs" role="tablist" aria-label="AI assistant tools">
          <button type="button" role="tab" aria-selected={activeTab === 'interview'} className={activeTab === 'interview' ? 'active' : ''} onClick={() => setActiveTab('interview')}>Interview prep</button>
          <button type="button" role="tab" aria-selected={activeTab === 'resume'} className={activeTab === 'resume' ? 'active' : ''} onClick={() => setActiveTab('resume')}>Resume review</button>
        </div>
      </header>

      {activeTab === 'interview' ? (
        <section className="ai-tool-layout">
          <div className="ai-tool-card ai-job-inputs">
            <h2>Prepare for a job</h2>
            <p className="ai-tool-help">Add the posting details to get role-based practice questions and revision topics.</p>
            {availableJobs.length > 0 && <label>Choose a job posting<select value={selectedJobId} onChange={(event) => handleSelectJob(event.target.value)}><option value="">Enter job details manually</option>{availableJobs.map((job) => <option value={job._id} key={job._id}>{job.title} — {job.companyName || job.company || 'Company'}</option>)}</select></label>}
            <label>Job title<input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="e.g. Frontend Developer" /></label>
            <label>Company<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" /></label>
            <label>Required skills<input value={requiredSkills} onChange={(event) => setRequiredSkills(event.target.value)} placeholder="React, TypeScript, REST APIs" /></label>
            <label>Job description<textarea rows="6" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the job description" /></label>
          </div>

          <div className="ai-tool-card ai-interview-results">
            <h2>Likely interview questions</h2>
            {!questions.length ? <p className="ai-tool-empty">Enter a job title or description to generate practice questions.</p> : (
              <>
                <div className="ai-question-list">
                  {questions.map((item) => (
                    <button type="button" key={item.id} className={`ai-question-card ${selectedQuestion?.id === item.id ? 'selected' : ''}`} onClick={() => selectQuestion(item)}>
                      <span className={`ai-question-category ${item.category.toLowerCase()}`}>{item.category}</span>
                      <strong>{item.question}</strong>
                      {item.category === 'Behavioral' && <small>Use Situation, Task, Action, Result (STAR).</small>}
                    </button>
                  ))}
                </div>
                <section className="ai-revision-topics">
                  <h3>Topics to revise</h3>
                  {skills.length ? <div className="ai-topic-chips">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>Add the required skills above to see revision topics.</p>}
                </section>
              </>
            )}
          </div>

          {selectedQuestion && (
            <section className="ai-tool-card ai-practice-panel">
              <h2>Practice your answer</h2>
              <p className="ai-practice-question">{selectedQuestion.question}</p>
              {selectedQuestion.category === 'Behavioral' && (
                <div className="ai-star-helper">
                  <h3>STAR helper</h3>
                  {['situation', 'task', 'action', 'result'].map((part) => <label key={part}>{part[0].toUpperCase() + part.slice(1)}<textarea rows="2" value={star[part]} onChange={(event) => updateStar(part, event.target.value)} placeholder={`What was the ${part}?`} /></label>)}
                </div>
              )}
              <label className="ai-answer-label">Your answer<textarea rows="6" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer here..." /></label>
              {feedback.length > 0 && <div className="ai-feedback"><h3>Answer feedback</h3>{feedback.map((item) => <p key={item.label}><strong>{item.label}:</strong> {item.text}</p>)}</div>}
            </section>
          )}
        </section>
      ) : (
        <section className="ai-tool-card ai-resume-review">
          <div>
            <h2>Resume review</h2>
            <p className="ai-tool-help">Upload a PDF or scanned resume image for text extraction, or paste the resume text. You’ll get a checklist of edits to consider, with no score.</p>
          </div>
          <label className="ai-resume-upload">Upload resume (PDF or image, max 5 MB)<input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,application/pdf,image/png,image/jpeg,image/webp,image/bmp" disabled={ocrLoading} onChange={handleResumeUpload} /></label>
          {ocrLoading && <div className="ai-ocr-progress" role="status"><span>{ocrStatus || 'Processing resume...'}</span><progress max="100" value={ocrProgress} /></div>}
          {!ocrLoading && ocrStatus && <p className="ai-ocr-status" role="status">{ocrStatus}</p>}
          {ocrError && <p className="ai-ocr-error" role="alert">{ocrError}</p>}
          <label className="ai-resume-text-label">Resume text<textarea rows="15" value={resumeText} onChange={(event) => { setResumeText(event.target.value); setReviewRequested(false); }} placeholder="Extracted text appears here. You can also paste your resume manually, including headings and experience bullets..." /></label>
          <button type="button" className="ai-primary-button" disabled={!resumeText.trim() || ocrLoading} onClick={() => setReviewRequested(true)}>Review resume</button>
          {reviewRequested && (
            <div className="ai-resume-checklist">
              <h3>Suggested actions</h3>
              {resumeChecklist.map((item) => <article className={`ai-checklist-item ${item.needsAttention ? 'needs-attention' : ''}`} key={item.id}><span aria-hidden="true">{item.needsAttention ? '!' : '✓'}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default AIPage;

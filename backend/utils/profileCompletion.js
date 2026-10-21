const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const hasEntries = (value) => Array.isArray(value) && value.some((item) => hasText(item));

const getMissingProfileFields = (profile, role) => {
  const required = role === 'recruiter'
    ? [
        ['name', 'Full name'], ['phone', 'Phone'], ['companyName', 'Company name'],
        ['companyWebsite', 'Company website'], ['companyLocation', 'Company location'],
        ['companyIndustry', 'Industry'], ['companyDescription', 'About the company']
      ]
    : [
        ['name', 'Full name'], ['phone', 'Phone'], ['headline', 'Professional headline'],
        ['location', 'Location'], ['about', 'About'], ['skills', 'Skills'],
        ['experience', 'Experience'], ['education', 'Education'], ['resumeData', 'Resume']
      ];

  return required.filter(([field]) => {
    const value = profile?.[field];
    if (field === 'skills' || field === 'experience' || field === 'education') return !hasEntries(value);
    if (field === 'resumeData') return !hasText(value) || !hasText(profile?.resumeName);
    return !hasText(value);
  }).map(([, label]) => label);
};

module.exports = { getMissingProfileFields };

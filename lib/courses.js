// Fee calculation based on date
export function getCurrentFee() {
  const today = new Date();
  const cutoffDate = new Date('2026-03-01');
  
  if (today < cutoffDate) {
    // Till Feb 28, 2026: Rs 99 + 18% GST
    const basePrice = 99;
    const gst = basePrice * 0.18;
    return {
      basePrice: basePrice * 100, // in paise
      gst: Math.round(gst * 100), // in paise
      total: Math.round((basePrice + gst) * 100), // in paise
      displayBase: basePrice,
      displayGst: gst.toFixed(2),
      displayTotal: (basePrice + gst).toFixed(2),
      period: 'Early Bird Special (Till Feb 28, 2026)'
    };
  } else {
    // From March 1, 2026: Rs 299 + 18% GST
    const basePrice = 299;
    const gst = basePrice * 0.18;
    return {
      basePrice: basePrice * 100, // in paise
      gst: Math.round(gst * 100), // in paise
      total: Math.round((basePrice + gst) * 100), // in paise
      displayBase: basePrice,
      displayGst: gst.toFixed(2),
      displayTotal: (basePrice + gst).toFixed(2),
      period: 'Regular Price (From March 1, 2026)'
    };
  }
}

export const courses = [
  // Free Courses (5)
  {
    id: 'learn-chemistry',
    name: 'Learn Chemistry',
    description: 'Master chemistry concepts from basics to advanced topics',
    isFree: true,
    features: [
      'Comprehensive chemistry fundamentals',
      'Practical experiments and applications',
      'Interactive lessons',
      'Free access to all content'
    ]
  },
  {
    id: 'learn-geography',
    name: 'Learn Geography',
    description: 'Explore world geography and environmental studies',
    isFree: true,
    features: [
      'World geography coverage',
      'Environmental and physical geography',
      'Map skills and spatial awareness',
      'Free access to all content'
    ]
  },
  {
    id: 'learn-math',
    name: 'Learn Math',
    description: 'Build strong mathematical foundations and problem-solving skills',
    isFree: true,
    features: [
      'Mathematical concepts from basics to advanced',
      'Problem-solving techniques',
      'Practice exercises',
      'Free access to all content'
    ]
  },
  {
    id: 'learn-physics',
    name: 'Learn Physics',
    description: 'Understand physical laws and phenomena through engaging content',
    isFree: true,
    features: [
      'Physics fundamentals',
      'Real-world applications',
      'Interactive demonstrations',
      'Free access to all content'
    ]
  },
  {
    id: 'learn-apt',
    name: 'Learn Apt',
    description: 'Develop cognitive abilities and aptitude skills',
    isFree: true,
    features: [
      'Cognitive skill development',
      'Aptitude test preparation',
      'Brain training exercises',
      'Free access to all content'
    ]
  },
  // Paid Courses (4)
  {
    id: 'learn-pr',
    name: 'Learn PR',
    description: 'Master public relations and corporate communications in the digital age',
    isPaid: true,
    features: [
      'Strategic PR planning',
      'Media relations mastery',
      'Crisis communication',
      'Digital PR strategies'
    ]
  },
  {
    id: 'learn-ai',
    name: 'Learn AI',
    description: 'Master artificial intelligence and transform your career with cutting-edge AI skills',
    isPaid: true,
    features: [
      'Comprehensive AI fundamentals',
      'Real-world AI applications',
      'Hands-on projects',
      'Certificate of completion'
    ]
  },
  {
    id: 'learn-management',
    name: 'Learn Management',
    description: 'Develop essential leadership and management skills for modern organizations',
    isPaid: true,
    features: [
      'Strategic management principles',
      'Team leadership techniques',
      'Project management essentials',
      'Decision-making frameworks'
    ]
  },
  {
    id: 'learn-developer',
    name: 'Learn Developer',
    description: 'Build professional software development skills from fundamentals to advanced',
    isPaid: true,
    features: [
      'Full-stack development',
      'Modern frameworks and tools',
      'Industry best practices',
      'Portfolio projects'
    ]
  },
  {
    id: 'learn-ai-developer-combo',
    name: 'Learn AI + Learn Developer',
    description: 'Complete bundle: Master both AI and software development skills - Two apps for the price of one!',
    isPaid: true,
    isCombo: true,
    comboPrice: true, // Same price as Learn AI (Rs 99 + GST)
    features: [
      'All Learn AI course content',
      'All Learn Developer course content',
      'Integrated projects combining AI and development',
      'Special combo pricing - Two courses for Rs 99 + GST!'
    ]
  }
];

export function getCourseById(courseId) {
  return courses.find(course => course.id === courseId);
}

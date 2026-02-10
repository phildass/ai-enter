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
  {
    id: 'ai-ml-fundamentals',
    name: 'AI & Machine Learning Fundamentals',
    description: 'Master the basics of artificial intelligence and machine learning',
    features: [
      '12 weeks of comprehensive content',
      'Hands-on projects',
      'Certificate of completion',
      'Lifetime access'
    ]
  },
  {
    id: 'cloud-essentials',
    name: 'Cloud Computing Essentials',
    description: 'Learn AWS, Azure, and Google Cloud platforms',
    features: [
      '10 weeks of cloud expertise',
      'Real-world scenarios',
      'Industry certification prep',
      '24/7 support'
    ]
  },
  {
    id: 'fullstack-dev',
    name: 'Full Stack Development',
    description: 'Build modern web applications from scratch',
    features: [
      '16 weeks intensive training',
      'Build 5+ projects',
      'Job placement assistance',
      'Expert mentorship'
    ]
  },
  {
    id: 'data-science',
    name: 'Data Science & Analytics',
    description: 'Transform data into actionable insights',
    features: [
      '14 weeks of data mastery',
      'Python & R programming',
      'Portfolio projects',
      'Career guidance'
    ]
  }
];

export function getCourseById(courseId) {
  return courses.find(course => course.id === courseId);
}

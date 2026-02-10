export const courses = [
  {
    id: 'ai-ml-fundamentals',
    name: 'AI & Machine Learning Fundamentals',
    description: 'Master the basics of artificial intelligence',
    price: 499900, // in paise (₹4,999)
    currency: 'INR',
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
    description: 'Learn AWS, Azure, and Google Cloud',
    price: 599900, // in paise (₹5,999)
    currency: 'INR',
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
    description: 'Build modern web applications',
    price: 799900, // in paise (₹7,999)
    currency: 'INR',
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
    description: 'Transform data into insights',
    price: 649900, // in paise (₹6,499)
    currency: 'INR',
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

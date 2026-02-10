// Fisher-Yates shuffle algorithm for proper randomization
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random images excluding hero images
export function getRandomImages(count = 3) {
  const allImages = [
    'aienter-rm2.jpg',
    'aienter-rm3.jpg',
    'aienter-rm4.jpg',
    'aienter-rm5.jpg',
    'aienter-rm7.jpg',
    'aienter-rm8.jpg',
    'aienter-rm9.jpg',
    'aienter-rm10.jpg',
    'aienter-rm11.jpg'
  ];
  
  const shuffled = shuffleArray(allImages);
  return shuffled.slice(0, count);
}

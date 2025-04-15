// grabbing all the dom elements we need
const setupSection = document.getElementById('setupSection');
const quizSection = document.getElementById('quizSection');
const resultsSection = document.getElementById('resultsSection');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const timerDisplay = document.getElementById('timer');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const minutesInput = document.getElementById('minutes');
const questionCountDisplay = document.getElementById('questionCount');
const correctCountDisplay = document.getElementById('correctCount');
const incorrectCountDisplay = document.getElementById('incorrectCount');
const totalQuestionsDisplay = document.getElementById('totalQuestions');
const correctAnswersDisplay = document.getElementById('correctAnswers');
const accuracyRateDisplay = document.getElementById('accuracyRate');

// quiz state stuff
let timerInterval;
let timeRemaining = 0;
let currentQuestion = null;
let selectedOption = null;
let stats = {
    questionCount: 0,
    correctCount: 0,
    incorrectCount: 0
};

// keeping track of questions we've already seen to avoid repeats
let usedQuestionIndices = [];

// nj math league style questions with more geometry focus
const questionsBank = [
    {
        question: "In a triangle ABC, the medians to sides AB, BC, and CA have lengths 5, 6, and 7 respectively. Find the perimeter of the triangle.",
        options: ["12", "16", "24", "30", "36"],
        answer: "24",
        explanation: "For a triangle with medians ma, mb, and mc, the relation between the sides a, b, c is: 4(ma² + mb² + mc²) = 3(a² + b² + c²). Substituting the median values and solving for the perimeter a + b + c = 24."
    },
    {
        question: "In a circle, a chord of length 12 is at a distance of 4 from the center. What is the radius of the circle?",
        options: ["5", "6.5", "8", "10", "13"],
        answer: "8",
        explanation: "If d is the distance from the center to the chord, c is the chord length, and r is the radius, then c/2 = √(r² - d²). So 6 = √(r² - 16), therefore r² = 36 + 16 = 64, and r = 8."
    },
    {
        question: "The sum of the infinite geometric series 27 + 9 + 3 + 1 + ... is:",
        options: ["27", "40", "40.5", "54", "81"],
        answer: "40.5",
        explanation: "This is a geometric series with first term a = 27 and common ratio r = 1/3. The sum is a/(1-r) = 27/(1-1/3) = 27/(2/3) = 40.5"
    },
    {
        question: "A sphere is inscribed in a cube with side length 10. What is the volume of the sphere?",
        options: ["250π/3", "125π", "500π/3", "500π", "1000π/3"],
        answer: "500π/3",
        explanation: "The diameter of the sphere equals the side length of the cube, so radius r = 5. Volume = (4/3)πr³ = (4/3)π·5³ = (4/3)π·125 = 500π/3"
    },
    {
        question: "Find all values of x that satisfy the equation log₃(x) + log₃(x-2) = 1.",
        options: ["x = 3", "x = 3 or x = -1", "x = 3 or x = 1", "x = 3 or x = 0", "x = 3 or x = 2"],
        answer: "x = 3",
        explanation: "log₃(x) + log₃(x-2) = 1\nlog₃(x(x-2)) = 1\nx(x-2) = 3¹\nx² - 2x = 3\nx² - 2x - 3 = 0\n(x-3)(x+1) = 0\nx = 3 or x = -1\nSince log₃(x-2) requires x-2 > 0, x must be greater than 2. Therefore only x = 3 is valid."
    },
    {
        question: "In a regular hexagon with side length 2, what is the distance between two opposite vertices?",
        options: ["2", "4", "2√3", "4√3", "6"],
        answer: "4",
        explanation: "In a regular hexagon, the distance between opposite vertices equals twice the side length. So the distance is 2 × 2 = 4."
    },
    {
        question: "The complex number z = 3 + 4i is rotated 90° counterclockwise about the origin. What is the resulting complex number?",
        options: ["-4 + 3i", "4 - 3i", "-3 - 4i", "-4 - 3i", "-3 + 4i"],
        answer: "-4 + 3i",
        explanation: "Rotating z = 3 + 4i by 90° counterclockwise is equivalent to multiplying by i. So z' = i(3 + 4i) = 3i + 4i² = 3i + 4(-1) = -4 + 3i"
    },
    {
        question: "In a cyclic quadrilateral, one of the angles is 70° and the two opposite angles are equal. Find the measure of these equal angles.",
        options: ["70°", "80°", "110°", "120°", "140°"],
        answer: "110°",
        explanation: "In a cyclic quadrilateral, opposite angles are supplementary (sum to 180°). So if one angle is 70°, its opposite angle is 180° - 70° = 110°. Since two opposite angles are equal, they must both be 110°."
    },
    {
        question: "If f(x) = x³ - 3x² + 4 and g(x) = 2x - 1, find f(g(1)).",
        options: ["0", "1", "2", "3", "4"],
        answer: "2",
        explanation: "g(1) = 2(1) - 1 = 1\nf(g(1)) = f(1) = 1³ - 3(1)² + 4 = 1 - 3 + 4 = 2"
    },
    {
        question: "If sec θ = 2 and θ is in the first quadrant, find the value of sin θ.",
        options: ["√3/2", "1/√2", "1/2", "√3/3", "√3"],
        answer: "√3/2",
        explanation: "If sec θ = 2, then cos θ = 1/2. Using the Pythagorean identity sin²θ + cos²θ = 1, we get sin²θ + (1/2)² = 1, so sin²θ = 1 - 1/4 = 3/4, thus sin θ = √(3/4) = √3/2 (since θ is in the first quadrant, sin θ is positive)."
    },
    {
        question: "Two circles with radii 3 and 5 are externally tangent. What is the length of their common external tangent?",
        options: ["4", "4√3", "8", "2√15", "√34"],
        answer: "2√15",
        explanation: "For two externally tangent circles with radii r and R, the length of their common external tangent is 2√(rR). So the length is 2√(3·5) = 2√15."
    },
    {
        question: "A fair six-sided die is rolled 4 times. What is the probability of getting at least one 6?",
        options: ["1/6", "5/6", "1/1296", "671/1296", "625/1296"],
        answer: "671/1296",
        explanation: "P(at least one 6) = 1 - P(no 6) = 1 - (5/6)⁴ = 1 - 625/1296 = 671/1296"
    },
    {
        question: "In triangle ABC, AB = 13, BC = 14, and CA = 15. Find the length of the altitude from C to AB.",
        options: ["12", "12.4", "12.8", "13.4", "14"],
        answer: "12",
        explanation: "Using Heron's formula, the area is √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2 = (13+14+15)/2 = 21. Area = √(21(21-13)(21-14)(21-15)) = √(21·8·7·6) = √(7056) = 84. The altitude h from C to AB equals 2·Area/AB = 2·84/14 = 12."
    },
    {
        question: "The area of a triangle whose vertices are at (0,0), (4,1), and (2,5) is:",
        options: ["6", "9", "10", "12", "15"],
        answer: "9",
        explanation: "Using the formula Area = (1/2)|x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|, we get Area = (1/2)|0(1-5) + 4(5-0) + 2(0-1)| = (1/2)|0(-4) + 4(5) + 2(-1)| = (1/2)|0 + 20 - 2| = (1/2)(18) = 9"
    },
    {
        question: "The sum of all positive divisors of 60 is:",
        options: ["96", "108", "120", "144", "168"],
        answer: "168",
        explanation: "The positive divisors of 60 = 2³·3·5 are 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, and 60. Their sum is 168."
    },
    {
        question: "A circle has its center at the origin and passes through the point (4, 3). What is the equation of the circle?",
        options: ["x² + y² = 16", "x² + y² = 25", "x² + y² = 7", "(x-4)² + (y-3)² = 25", "(x+4)² + (y+3)² = 25"],
        answer: "x² + y² = 25",
        explanation: "The distance from the origin to the point (4, 3) is √(4² + 3²) = √(16 + 9) = √25 = 5. This is the radius of the circle. Therefore, the equation is x² + y² = 5² = 25."
    },
    {
        question: "For what value of k will the equation 3x² + kx + 3 = 0 have equal roots?",
        options: ["±6", "±√6", "6", "±6√3", "±6i"],
        answer: "±6",
        explanation: "For a quadratic equation ax² + bx + c = 0 to have equal roots, the discriminant b² - 4ac must equal 0. So k² - 4(3)(3) = 0, k² = 36, k = ±6."
    },
    {
        question: "The locus of points that are equidistant from the point (0, 4) and the line y = -2 is:",
        options: ["A line", "A parabola", "An ellipse", "A hyperbola", "A circle"],
        answer: "A parabola",
        explanation: "The locus of points equidistant from a point (the focus) and a line (the directrix) is a parabola. Here the focus is (0, 4) and the directrix is y = -2."
    },
    {
        question: "In a triangle ABC, if the angle bisector from A divides the side BC in ratio 3:2, find the ratio AB:AC.",
        options: ["2:3", "3:2", "3:5", "2:5", "5:3"],
        answer: "3:2",
        explanation: "If an angle bisector divides the opposite side in the ratio m:n, then the adjacent sides are in the ratio m:n as well. So if BC is divided in ratio 3:2, then AB:AC = 3:2."
    },
    {
        question: "If the sides of a triangle are 8, 15, and 17, what is the radius of its circumscribed circle?",
        options: ["8.5", "7.5", "9", "10", "8"],
        answer: "8.5",
        explanation: "For a triangle with sides a, b, c, the radius R of the circumscribed circle is given by R = abc/(4·Area). The area using Heron's formula is 60, so R = 8·15·17/(4·60) = 8.5"
    }
];

// setting up our event listeners
startBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', submitAnswer);
nextBtn.addEventListener('click', loadNextQuestion);
restartBtn.addEventListener('click', restartQuiz);

// helper functions for the quiz
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getRandomQuestion() {
    // if we've used all the questions, just reset and start over
    if (usedQuestionIndices.length >= questionsBank.length) {
        usedQuestionIndices = [];
    }
    
    // keep trying until we find a question we haven't used yet
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questionsBank.length);
    } while (usedQuestionIndices.includes(randomIndex));
    
    // mark this one as used so we don't show it again
    usedQuestionIndices.push(randomIndex);
    
    return questionsBank[randomIndex];
}

function loadQuestion() {
    currentQuestion = getRandomQuestion();
    questionText.textContent = currentQuestion.question;
    
    // clear out any old options first
    optionsContainer.innerHTML = '';
    
    // add the new options
    currentQuestion.options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(optionElement, option));
        optionsContainer.appendChild(optionElement);
    });
    
    submitBtn.style.display = 'inline-block';
    nextBtn.style.display = 'none';
    selectedOption = null;
}

function selectOption(element, option) {
    // clear any previously selected options
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    
    // highlight the one they just picked
    element.classList.add('selected');
    selectedOption = option;
}

function updateStats() {
    questionCountDisplay.textContent = stats.questionCount;
    correctCountDisplay.textContent = stats.correctCount;
    incorrectCountDisplay.textContent = stats.incorrectCount;
}

// main quiz functions
function startQuiz() {
    // grab the timer setting and convert to seconds
    const minutes = parseInt(minutesInput.value) || 5;
    timeRemaining = minutes * 60;
    
    // reset all our counters
    stats = {
        questionCount: 0,
        correctCount: 0,
        incorrectCount: 0
    };
    
    // clear the list of used questions
    usedQuestionIndices = [];
    
    // show the quiz and hide everything else
    setupSection.style.display = 'none';
    quizSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // update what's shown on screen
    timerDisplay.textContent = formatTime(timeRemaining);
    updateStats();
    
    // start the countdown
    timerInterval = setInterval(updateTimer, 1000);
    
    // get the first question ready
    loadQuestion();
}

function updateTimer() {
    timeRemaining--;
    timerDisplay.textContent = formatTime(timeRemaining);
    
    // check if time's up
    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        endQuiz();
    }
}

function submitAnswer() {
    if (selectedOption === null) {
        alert('Please select an answer!');
        return;
    }
    
    stats.questionCount++;
    
    // find which option they selected
    const options = document.querySelectorAll('.option');
    let selectedElement;
    
    options.forEach(option => {
        if (option.classList.contains('selected')) {
            selectedElement = option;
        }
        
        // show which one was the right answer
        if (option.textContent === currentQuestion.answer) {
            option.classList.add('correct');
        }
    });
    
    // check if they got it right
    if (selectedOption === currentQuestion.answer) {
        stats.correctCount++;
    } else {
        stats.incorrectCount++;
        if (selectedElement) {
            selectedElement.classList.add('incorrect');
        }
    }
    
    // update the counters
    updateStats();
    
    // show them why the answer is what it is
    const explanationElement = document.createElement('div');
    explanationElement.classList.add('explanation');
    explanationElement.innerHTML = `<strong>Explanation:</strong> ${currentQuestion.explanation}`;
    questionText.appendChild(explanationElement);
    
    // hide submit and show next
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
}

function loadNextQuestion() {
    loadQuestion();
}

function endQuiz() {
    // show the results page
    quizSection.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // update the final stats
    totalQuestionsDisplay.textContent = stats.questionCount;
    correctAnswersDisplay.textContent = stats.correctCount;
    
    // figure out their accuracy percentage
    const accuracy = stats.questionCount > 0 
        ? Math.round((stats.correctCount / stats.questionCount) * 100) 
        : 0;
    accuracyRateDisplay.textContent = `${accuracy}%`;
}

function restartQuiz() {
    // go back to the setup screen
    resultsSection.style.display = 'none';
    setupSection.style.display = 'flex';
}
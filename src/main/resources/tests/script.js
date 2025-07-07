const shuffled = (array) => array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

const startButton = document.querySelector('button.start');
const finishButton = document.querySelector('button.finish');
const questions = [...document.querySelectorAll(`[data-question]`)];
const questionsCount = questions.length;
const questionNumbers = [...document.querySelectorAll(`[data-question]`)].map(q => q.dataset.question);
    //= shuffled([...document.querySelectorAll(`[data-question]`)].map(q => q.dataset.question));
let questionIndex = 0;

const selectQuestion = (number) => document.querySelector(`[data-question="${number}"]`);
const selectQuestionAnswers = (number) => document.querySelectorAll(`[data-question="${number}"] .question-answers .question-answer`);
const showQuestion = (number) => selectQuestion(number).classList.remove("hidden");
const hideQuestion = (number) => selectQuestion(number).classList.add("hidden");
const updateInfo = () => document.querySelector('.info').innerText = `${questionIndex + 1}/${questionsCount}`;
const selectAnswers = () => document.querySelectorAll(`[data-question="${questionNumbers[questionIndex]}"] .question-answers .question-answer`);
const resetAnswerHints = () => selectAnswers().forEach((element) => element.classList.remove('incorrect-answer', 'correct-answer'));
const toggleHint = (mode, questionNumber) => {
    const hint = document.querySelector(`[data-question="${questionNumber}"] p.question-explanation`);
    hint.style.visibility = mode;
    if (mode === 'visible') {
        document.querySelectorAll(`[data-question="${questionNumber}"] [data-is-correct="True"]`)
            .forEach((element) => element.classList.add('correct-answer'));
        document.querySelectorAll(`[data-question="${questionNumber}"] [data-is-correct="False"]`)
            .forEach((element) => element.classList.add('incorrect-answer'));
    } else {
        resetAnswerHints();
    }
};
const calculateEndTime = () => new Date(Date.now() + questionsCount * 1.8 * 60000).getTime();
let endTime = calculateEndTime();
const formatTimer = (value) => value < 10 ? '0' + value : value;
const updateTimer = () => {
    const now = Date.now();
    const timeLeft = endTime - now;
    //const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    document.querySelector(".timer").innerHTML = formatTimer(hours) + ':' + formatTimer(minutes) + ':' + formatTimer(seconds);
    if (timeLeft < 0) {
        finish();
    }
};
let timerInterval;
const start = () => {
    endTime = calculateEndTime();
    startButton.style.display = 'none';
    finishButton.style.display = 'block';
    timerInterval = setInterval(updateTimer, 1000);
};
const finish = () => {
    const isCorrect = (question) => [...selectQuestionAnswers(question)]
        .map((answer) => {
            const correctValue = answer.dataset.isCorrect === 'True';
            const selectedValue = answer.getElementsByTagName('input')[0].checked;
            return correctValue === selectedValue;
        })
        .every(v => v === true);
    const correctQuestions = questionNumbers.map(isCorrect).filter(Boolean).length;
    const score = (correctQuestions * 100) / questionsCount;
    const timer = document.querySelector(".timer");
    clearInterval(timerInterval);
    finishButton.style.visibility = 'hidden';
    timer.innerHTML = `Score: ${score.toFixed(2)}% / ${score >= 68 ? 'Passed' : 'Failed'}`;
    questionNumbers.forEach((questionNumber) => {
        toggleHint('visible', questionNumber);
    });
};

questions.forEach((question) => question.classList.add("hidden"));
updateInfo();
updateTimer();
showQuestion(questionNumbers[questionIndex]);

startButton.addEventListener('click', start);
finishButton.addEventListener('click', finish);
document.addEventListener('keyup', function (event) {
    const currentQuestionNumber = questionNumbers[questionIndex];
    switch (event.key) {
        case "ArrowLeft":
            if (questionIndex === 0) {
                return;
            }
            toggleHint('hidden', currentQuestionNumber);
            hideQuestion(currentQuestionNumber);
            questionIndex--;
            break;
        case "ArrowRight":
            if (questionIndex === questionsCount - 1) {
                return;
            }
            toggleHint('hidden', currentQuestionNumber);
            hideQuestion(currentQuestionNumber);
            questionIndex++;
            break;
        case "h":
            toggleHint('hidden', currentQuestionNumber);
            break;
        case "s":
            toggleHint('visible', currentQuestionNumber);
            break;
    }
    showQuestion(questionNumbers[questionIndex]);
    updateInfo();
});

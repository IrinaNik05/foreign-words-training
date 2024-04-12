'use strict';

const slider = document.querySelector('.slider');
const flipCard = document.querySelector('.flip-card');
const cardFront = document.querySelector('#card-front');
const cardBack = document.querySelector('#card-back');
const frontWord = cardFront.querySelector('h1');
const backWord = cardBack.querySelector('h1');
const backText = cardBack.querySelector('span');
const currentWord = document.querySelector('#current-word')
const progress = document.querySelector('#words-progress');
const information = [{
        englishWord: 'animal',
        russianWord: 'животное',
        sentence: 'There are a lot of animals in this zoo.'
    },
    {
        englishWord: 'police',
        russianWord: 'полиция',
        sentence: 'Call the police as soon as possible!'
    },
    {
        englishWord: 'airport',
        russianWord: 'аэропорт',
        sentence: 'We will go to the airport by taxi.'
    },
    {
        englishWord: 'family',
        russianWord: 'семья',
        sentence: 'My family lives in Russia.'
    },
    {
        englishWord: 'frog',
        russianWord: 'лягушка',
        sentence: 'French people eat frogs.'
    },
    {
        englishWord: 'home',
        russianWord: 'дом',
        sentence: 'I came home late.'
    }
];

const currentInformation = [...information];

slider.addEventListener('click', function() {
    flipCard.classList.toggle('active');
});

let i = 0;
const levelProgress = +(100 / currentInformation.length).toFixed(2);
progress.value = levelProgress;

function addInformation(i) {
    frontWord.textContent = currentInformation[i].englishWord;
    backWord.textContent = currentInformation[i].russianWord;
    backText.textContent = currentInformation[i].sentence;
};

addInformation(i);

const next = document.querySelector('#next');
const back = document.querySelector('#back');
let curr = 1;

next.addEventListener('click', function() {
    i++;
    curr++;
    addInformation(i);
    currentWord.textContent = curr;
    progress.value += levelProgress;
    back.disabled = false;

    if (i === currentInformation.length - 1) {
        next.setAttribute('disabled', 'disabled');
    };
    localStorage.setItem('wordProgress', progress.value);
});

back.addEventListener('click', function() {
    i--;
    curr--;
    addInformation(i);
    currentWord.textContent = curr;
    progress.value -= levelProgress;
    next.disabled = false;

    if (i === 0) {
        back.disabled = true;
    };
    localStorage.setItem('wordProgress', progress.value);
});

function mixWords(arr) {
    arr.sort(() => Math.random() - 0.5);
};

const shuffleWords = document.querySelector('#shuffle-words');

shuffleWords.addEventListener('click', function() {
    mixWords(currentInformation);
    addInformation(i);
    localStorage.setItem('mixWords', JSON.stringify(currentInformation));
});

const exam = document.querySelector('#exam');
const studyCards = document.querySelector('.study-cards');
const studyMode = document.querySelector('#study-mode');
const examMode = document.querySelector('#exam-mode');
const examCards = document.querySelector('#exam-cards');

const englishWords = currentInformation.map(function(item) {
    return item.englishWord;
});
const russianWords = currentInformation.map(function(item) {
    return item.russianWord;
});
const allWords = [...englishWords, ...russianWords];

let seconds = 0;
let minutes = 0;
let interval;
const timer = document.querySelector('#time');

function countTime() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    };
    timer.textContent = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
};

exam.addEventListener('click', function() {
    studyCards.classList.add('hidden');
    studyMode.classList.add('hidden');
    examMode.classList.remove('hidden');
    mixWords(allWords);

    const fragment = new DocumentFragment();
    for (let b = 0; b < allWords.length; b++) {
        const element = document.createElement('span');
        element.classList.add('card');
        element.textContent = allWords[b];
        fragment.append(element);
    };
    examCards.append(fragment);

    interval = setInterval(countTime, 1000);
});

let firstCard = 0;
let secondCard = 0;
let firstCardIndex = 0;
let secondCardIndex = 0;
let flag = false;
const examProgress = document.querySelector('#exam-progress');
const correctPercent = document.querySelector('#correct-percent');
const resultsModal = document.querySelector('.results-modal');
const template = document.querySelector('#word-stats');
const resultsContent = document.querySelector('.results-content');
const time = document.querySelector('.time');

function addWordStatistics(key, value) {
    const item = template.content.cloneNode(true);
    item.querySelector('.word span').textContent = key;
    item.querySelector('.attempts span').textContent = value;
    return item;
};

let statistics = {};
let rightAnswers = 0;
let wrongAnswers = 0;

function addStatistics(answer) {
    if (statistics[firstCard.textContent]) {
        statistics[firstCard.textContent] += 1;
    } else {
        statistics[firstCard.textContent] = 1;
        answer += 1;
    };
};

function removeCorrectCards() {
    firstCard.classList.add("fade-out");
    secondCard.classList.add("correct");
    secondCard.classList.add("fade-out");
};

function completeTesting() {
    document.querySelector('.motivation').textContent = 'Тестирование завершено!';
    resultsModal.classList.remove('hidden');
    time.textContent = timer.textContent;
};

function renderStats() {
    Object.entries(statistics).forEach((elem) => {
        resultsContent.append(addWordStatistics(elem[0], elem[1]));
    })
};

function addProgressValue() {
    examProgress.value += levelProgress;
    correctPercent.textContent = examProgress.value.toFixed() + '%';
};

examCards.addEventListener('click', function(event) {
    const card = event.target.closest('.card');

    if (!flag) {
        card.classList.add('correct');
        firstCard = card;
        firstCardIndex = currentInformation.findIndex((item) => item.englishWord === card.textContent || item.russianWord === card.textContent);
        flag = true;

    } else {
        secondCard = card;
        secondCardIndex = currentInformation.findIndex((item) => item.englishWord === card.textContent || item.russianWord === card.textContent);

        if (firstCardIndex === secondCardIndex && firstCard !== secondCard) {
            removeCorrectCards();
            addStatistics(rightAnswers);
            addProgressValue();
            localStorage.setItem('examProgress', examProgress.value);

            if (examProgress.value === 100) {
                renderStats();
                clearInterval(interval);
                completeTesting();
                localStorage.setItem('time', time.textContent);
            };
            flag = false;
        } else if (firstCardIndex !== secondCardIndex || firstCard === secondCard) {
            addStatistics(wrongAnswers);
            flag = false;
            secondCard.classList.add("wrong");

            setTimeout(() => {
                firstCard.classList.remove("correct");
                secondCard.classList.remove("wrong");
            }, 500);
        };
        localStorage.setItem('rightAnswers', rightAnswers);
        localStorage.setItem('wrongAnwers', wrongAnswers);
    }
});
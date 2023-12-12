let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let currentQuizQuestions = [];

// Funkcja do rozpoczęcia quizu i załadowania pytań dla danego przedmiotu
function startQuiz(subject, randomize, questionRange) {
    fetch('https://api.jsonbin.io/v3/b/65774c78266cfc3fde6772da', {
        method: 'GET',
        headers: {
          'X-Master-Key': '$2a$10$.3Jff8CL8j1TYeHi0IqhLONpWB6FyRuRN.fWTYflF5km0x5RDXWs2'
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.record);
        currentQuestionIndex = 0;
        correctAnswersCount = 0;

        if (randomize && !questionRange) {
            shuffleArray(data.record);
            currentQuizQuestions = data.record.slice(0, 15);
        } else if (questionRange) {
            const range = questionRange.split('-');
            const start = parseInt(range[0], 10) - 1;
            const end = parseInt(range[1], 10);
            currentQuizQuestions = data.record.slice(start, end);
            if (randomize) {
                shuffleArray(currentQuizQuestions); 
            }
        }
    

        showQuestion(currentQuizQuestions[currentQuestionIndex]);
      })
      .catch(error => {
        console.error('Błąd:', error);
      });
}



// Funkcja do wyświetlania pytania i przycisków odpowiedzi
function showQuestion(question) {
    const quizContainer = document.getElementById('quiz');
    quizContainer.style.display = 'block';
    const nieText = "nie";
    let nieIndex = question.answers.findIndex(answer => answer.text.toLowerCase() === nieText);
    if (nieIndex > -1 && nieIndex !== 0) {
        // Move the 'nie' answer to the beginning
        let nieAnswer = question.answers.splice(nieIndex, 1)[0];
        question.answers.unshift(nieAnswer);
    }

    const noneOfTheAboveIndex = question.answers.findIndex(answer => answer.text === "żadna z powyższych odpowiedzi");
    if (noneOfTheAboveIndex > -1 && noneOfTheAboveIndex !== question.answers.length - 1) {
        const noneOfTheAboveAnswer = question.answers.splice(noneOfTheAboveIndex, 1)[0];
        question.answers.push(noneOfTheAboveAnswer);
    }
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    // Wyczyść poprzednie pytania i odpowiedzi
    questionElement.innerText = question.question;
    answerButtonsElement.innerHTML = '';
    shuffleArray(question.answers);
    question.answers.forEach((answer, index) => {
      const button = document.createElement('button');
      button.innerText = answer.text;
      button.classList.add('btn');
      button.addEventListener('click', () => selectAnswer(answer.correct, button, question, answer));
      answerButtonsElement.appendChild(button);
    });

    const questionCounterElement = document.getElementById('question-counter');
    questionCounterElement.textContent = `Pytanie ${currentQuestionIndex + 1} z ${currentQuizQuestions.length}`;
  }

  function selectAnswer(isCorrect, button, question, answer) {
    const answerButtons = document.getElementById('answer-buttons').children;

    // Sprawdź, czy wcześniej zaznaczono inną odpowiedź i zaktualizuj liczbę poprawnych odpowiedzi
    if (question.selectedAnswer) {
        if (question.selectedAnswer.correct) {
            correctAnswersCount--; // Odejmij poprawną odpowiedź, jeśli wcześniej wybrano poprawną
        }
    }

    // Usuń klasy 'choice' z wszystkich przycisków
    Array.from(answerButtons).forEach(btn => {
        btn.classList.remove('choice');
    });

    // Dodaj klasę 'choice' do aktualnie wybranego przycisku
    button.classList.add('choice');

    // Zaktualizuj wybraną odpowiedź
    question.selectedAnswer = answer;
    answer.selected = true;

    // Zaktualizuj liczbę poprawnych odpowiedzi, jeśli odpowiedź jest poprawna
    if (isCorrect) {
        correctAnswersCount++;
    }

    console.log(correctAnswersCount);

    // Sprawdź, czy są jeszcze pytania
    if (currentQuestionIndex < currentQuizQuestions.length - 1) {
        document.getElementById('next-button').style.display = 'block';
    } else {
        // Jeśli to ostatnie pytanie, wywołaj podsumowanie
        showSummary();
    }
}


  // Funkcja do wyświetlania kolejnego pytania lub podsumowania
  function showNextQuestion() {
    // Dodatkowe sprawdzenie, aby uniknąć błędów
    if (currentQuestionIndex < currentQuizQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuizQuestions[currentQuestionIndex]);
        document.getElementById('next-button').style.display = 'none';
    }
}
  
function showSummary() {

    const quizContainer = document.getElementById('quiz');
    quizContainer.innerHTML = '';
    quizContainer.id = 'quiz-summary';

    const heading = document.createElement('h2');
    heading.innerText = 'Podsumowanie';
    heading.className = 'quiz-heading';
    quizContainer.appendChild(heading);

    currentQuizQuestions.forEach((question, index) => {
        const questionElem = document.createElement('div');
        questionElem.className = 'quiz-question-summary';
        questionElem.innerHTML = `<p>Pytanie ${index + 1}: ${question.question}</p>`;

        const answersList = document.createElement('div');

        question.answers.forEach(answer => {
            const answerDiv = document.createElement('div');
            answerDiv.innerText = answer.text;
            answerDiv.className = 'quiz-answer-summary';

            // Check if the answer was selected by the user
            if (answer === question.selectedAnswer) {
                answerDiv.classList.add('selected-answer-summary');
                // Apply color based on whether the answer is correct or not
                answerDiv.style.backgroundColor = answer.correct ? 'green' : 'red';
            }

            // Additionally, if the answer is correct, highlight it
            if (answer.correct) {
                answerDiv.style.backgroundColor = 'green';
            }

            answersList.appendChild(answerDiv);
        });

        questionElem.appendChild(answersList);
        quizContainer.appendChild(questionElem);
    });

    const resultElem = document.createElement('p');
    resultElem.innerText = `Poprawne odpowiedzi: ${correctAnswersCount} z ${currentQuizQuestions.length}`;
    resultElem.className = 'result'; // Klasa dla wyniku
    quizContainer.appendChild(resultElem);

    const retryButton = document.createElement('button');
    retryButton.innerText = 'Spróbuj ponownie';
    retryButton.className = 'button retry-button'; // Klasy dla przycisku
    retryButton.onclick = () => location.reload();
    quizContainer.appendChild(retryButton);

    let showSelectionButton = document.getElementById('show-selection-button');
    if (!showSelectionButton) {
        showSelectionButton = document.createElement('button');
        showSelectionButton.id = 'show-selection-button';
        showSelectionButton.textContent = 'Wybierz inny quiz';
        showSelectionButton.className = 'btn'; // Add styling classes as needed
        quizContainer.appendChild(showSelectionButton);

        // Attach event listener to this button
        showSelectionButton.addEventListener('click', () => {
            // Hide the quiz summary and show the quiz selection
            document.getElementById('quiz-summary').style.display = 'none';
            document.getElementById('quiz-selection').style.display = 'flex'; // Or 'flex', 'grid', etc. depending on your layout
            // Optionally reset the quiz
            resetQuiz();
        });
    }
    document.getElementById('quiz-summary').scrollIntoView();
}


document.addEventListener('DOMContentLoaded', () => {
    const nextButton = document.getElementById('next-button');
    if (nextButton) {
        nextButton.addEventListener('click', showNextQuestion);
    }
});

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }


  document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-settings');
    const backgroundInput = document.getElementById('background-url');
    const opacityInput = document.getElementById('opacity-range');
    const quizContainer = document.getElementById('quiz');
    const container = document.querySelector('.main-quiz-container');

    const toggleButton = document.getElementById('toggle-settings');
    const settingsContainer = document.getElementById('settings-container');

    toggleButton.addEventListener('click', () => {
        const buttonRect = toggleButton.getBoundingClientRect();
        const settingsRect = settingsContainer.getBoundingClientRect();

        // Sprawdzamy, czy szerokość okienka plus pozycja przycisku nie wykraczają poza ekran
        if (buttonRect.left < settingsRect.width) {
            // Jeśli okienko nie zmieści się po lewej stronie przycisku,
            // wyświetl je po prawej
            settingsContainer.style.left = `${buttonRect.right}px`;
            settingsContainer.style.right = 'auto';
        } else {
            // W przeciwnym razie wyświetl okienko po lewej stronie przycisku
            settingsContainer.style.right = `${document.body.clientWidth - buttonRect.left}px`;
            settingsContainer.style.left = 'auto';
        }

        

        settingsContainer.style.display = settingsContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Załaduj wcześniej zapisane ustawienia
    const savedBackground = localStorage.getItem('backgroundUrl');
    const savedOpacity = localStorage.getItem('quizOpacity');
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
        document.body.style.backgroundSize = 'contain';
        document.body.style.backgroundAttachment = 'fixed';
    }
    if (savedOpacity) {
        quizContainer.style.backgroundColor = `rgba(255, 255, 255, ${savedOpacity})`;
        container.style.backgroundColor = `rgba(255, 255, 255, ${savedOpacity})`;
        opacityInput.value = savedOpacity; // Ustaw wartość suwaka na wcześniej zapisaną przezroczystość
    }

    saveButton.addEventListener('click', () => {
        localStorage.setItem('backgroundUrl', backgroundInput.value);
        localStorage.setItem('containerOpacity', opacityInput.value);
        localStorage.setItem('quizOpacity', opacityInput.value);
        settingsContainer.style.display = 'none';
        applySettings(); // Funkcja, która zastosuje ustawienia
    });
    
    const quizSelection = document.getElementById('quiz-selection');
    const randomQuizButton = document.getElementById('random-quiz-button');
    const startQuizButton = document.getElementById('start-quiz-button');

    // Hide the quiz selection section when any of the quiz start buttons are clicked
    function hideQuizSelection() {
        quizSelection.style.display = 'none';
    }

    randomQuizButton.addEventListener('click', () => {
        randomize = true;
        startQuiz('Java', randomize);
        hideQuizSelection();
    });


    startQuizButton.addEventListener('click', () => {
        const questionRangeDropdown = document.getElementById('question-range');
        const selectedRange = questionRangeDropdown.value;
        randomize = true; // Assuming you want to shuffle regardless of the selected range
        startQuiz('Java', randomize, selectedRange);
        hideQuizSelection();
    });
});

function applySettings() {
    const backgroundUrl = localStorage.getItem('backgroundUrl');
    const quizOpacity = localStorage.getItem('quizOpacity');
    const quizContainer = document.getElementById('quiz');
    const container = document.querySelector('.main-quiz-container');

    if (backgroundUrl) {
        document.body.style.backgroundImage = `url(${backgroundUrl})`;
    }
    if (quizOpacity) {
        quizContainer.style.backgroundColor = `rgba(255, 255, 255, ${quizOpacity})`;
        container.style.backgroundColor = `rgba(255, 255, 255, ${quizOpacity})`;
    }
}


function resetQuiz() {
    // Reset quiz state as needed
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    currentQuizQuestions = [];
    // Reset other quiz-related states and UI elements if necessary
}
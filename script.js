let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let currentQuizQuestions = [];

// Funkcja do rozpoczęcia quizu i załadowania pytań dla danego przedmiotu
function startQuiz(subject) {
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
        // Mieszanie pytań
        shuffleArray(data.record);
        
        // Ograniczenie do pierwszych 15 pomieszanych pytań
        currentQuizQuestions = data.record.slice(0, 15);
    
        showQuestion(currentQuizQuestions[currentQuestionIndex]);

      })
      .catch(error => {
        console.error('Błąd:', error);
      });
}



// Funkcja do wyświetlania pytania i przycisków odpowiedzi
function showQuestion(question) {
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
            if (answer === question.selectedAnswer) {
                answerDiv.classList.add(answer.correct ? 'correct-answer-summary' : 'incorrect-answer-summary');
            } else {
                answerDiv.classList.add('unselected-answer-summary');
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

    const homeButton = document.createElement('button');
    homeButton.innerText = 'Powrót do strony głównej';
    homeButton.className = 'button home-button'; // Klasy dla przycisku
    homeButton.onclick = () => window.location.href = 'index.html';
    quizContainer.appendChild(homeButton);
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
    const container = document.querySelector('.container');

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
});

function applySettings() {
    const backgroundUrl = localStorage.getItem('backgroundUrl');
    const quizOpacity = localStorage.getItem('quizOpacity');
    const quizContainer = document.getElementById('quiz');
    const container = document.querySelector('.container');

    if (backgroundUrl) {
        document.body.style.backgroundImage = `url(${backgroundUrl})`;
    }
    if (quizOpacity) {
        quizContainer.style.backgroundColor = `rgba(255, 255, 255, ${quizOpacity})`;
        container.style.backgroundColor = `rgba(255, 255, 255, ${quizOpacity})`;
    }
}



// Na przykład, rozpoczęcie quizu z matematyki:
startQuiz('Java');

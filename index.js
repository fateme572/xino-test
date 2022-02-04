let testItems;
let answerStatus = []
let intervalQuestion = null
let intervalCountDown = null
const questionTime = 4
const startSectionElement = document.getElementById('js_start_section')
const midSectionElement = document.getElementById('js_mid_section')
const endSectionElement = document.getElementById('js_end_section')
const answersStatusWrapperElement = document.getElementById('answers_state')
const testResultText = document.getElementById('test_result')

document.getElementsByTagName('body')[0].addEventListener('load', async function () {
    testItems = await loadJson('./questions.json')
}())

function hiddenSection(el) {
    el.classList.add('d-none')
}

function showSection(el) {
    el.classList.remove('d-none')
}

function startTest() {
    // hidden start section
    hiddenSection(startSectionElement);

    // show mid section
    showSection(midSectionElement);

    generateQuestion()

    testItems.forEach(function (item, key) {
        answersStatusWrapperElement.appendChild(generateAnswerStatus(key))
    })

    resetInterval()
}

function resetInterval() {
    clearInterval(intervalQuestion)
    intervalQuestion = setInterval(function () {
        goToNextQuestion()
    }, questionTime * 1000)
}

function generateAnswerStatus(number) {
    const answerState = document.createElement('span')
    answerState.setAttribute('id', `answer_state_${number}`)
    answerState.setAttribute('class', 'answer-state')
    return answerState
}

function goToNextQuestion() {
    resetInterval()
    const questionNumber = Number(document.getElementById('hidden_input').getAttribute('value'))
    const selectedAnswer = document.querySelector('input[type=radio]:checked')

    if (!selectedAnswer) {
        answerStatus.push(false)
        document.getElementById(`answer_state_${questionNumber}`).classList.add('answer-wrong')
    }
    else {
        if (selectedAnswer.getAttribute('value') == testItems[questionNumber].answer) {
            answerStatus.push(true)
            document.getElementById(`answer_state_${questionNumber}`).classList.add('answer-success')
        }
        else {
            answerStatus.push(false)
            document.getElementById(`answer_state_${questionNumber}`).classList.add('answer-wrong')
        }
    }
    if (questionNumber + 1 < testItems.length) {
        generateQuestion(questionNumber + 1)
    }
    else {
        clearInterval(intervalQuestion)
        clearInterval(intervalCountDown)
        hiddenSection(document.getElementsByClassName('mid-section')[0])
        showSection(document.getElementsByClassName('end-section')[0])

        // generate text for result of text
        testResultText.innerHTML = generateTestResultText()

        const correctAnswerStat = getCorrectAnswerStat()
        correctAnswerStat.correctPercent > 50
            ? testResultText.classList.add('text-success')
            : testResultText.classList.add('text-danger')
    }
}

function generateQuestion(number = 0) {
    // clear interval for count down on each question time
    clearInterval(intervalCountDown)

    const questionHolder = document.getElementById('question')
    questionHolder.innerHTML = ''

    const questionText = document.createElement('span')
    questionText.innerText = testItems[number].question

    const hiddenInput = document.createElement('input')
    hiddenInput.setAttribute('type', 'hidden')
    hiddenInput.setAttribute('id', 'hidden_input')
    hiddenInput.setAttribute('value', number)

    questionHolder.appendChild(questionText)
    questionHolder.appendChild(hiddenInput)
    questionHolder.appendChild(generateProgressBarElement());

    // first: empty answers place
    const answersHolder = document.getElementById('answers')
    answersHolder.innerHTML = ''

    // second: generate answers DOM
    const shuffleAnswers = []
    for (let i = 0; i < testItems[number].answers.length; i++) {
        const answer = getRandomAnswer(shuffleAnswers, testItems[number].answers)
        shuffleAnswers.push(answer)
        answersHolder.appendChild(createAnswer(answer))
    }
}

function getRandomAnswer(generatedAnswers, answers) {
    const answersCount = answers.length
    const answer = answers[Math.floor(Math.random() * answersCount)]
    if (generatedAnswers.includes(answer)) {
        return getRandomAnswer(generatedAnswers, answers)
    }
    return answer
}

function createAnswer(v) {
    // hold answer text and input
    const answerHolder = document.createElement('span')
    answerHolder.setAttribute('class', 'answer-item')

    // create answer input
    const answerInput = document.createElement('input')
    answerInput.setAttribute('type', 'radio')
    answerInput.setAttribute('value', v)
    answerInput.setAttribute('name', 'answer')
    answerInput.setAttribute('id', v)

    // append to answerHolder
    answerHolder.appendChild(answerInput)

    // create answer text
    const answerText = document.createElement('label')
    answerText.setAttribute('for', v)
    answerText.innerText = v

    // append to answer holder
    answerHolder.appendChild(answerText)

    answerInput.addEventListener('change', goToNextQuestion)

    return answerHolder
}

async function loadJson(path) {
    return await fetch(path)
        .then(response => response.json())
        .then(res => res)
}

function restart() {
    answersStatusWrapperElement.innerHTML = ""
    answerStatus = []
    startTest()
    testResultText.setAttribute('class', '')
}

// generate test result based on answers status
function generateTestResultText() {
    const correctAnswerStat = getCorrectAnswerStat()
    const numberOfCorrectAnswers = correctAnswerStat.correctCount
    const numberOfTotalAnswers = answerStatus.length

    if (numberOfCorrectAnswers === 0) return "واقعا؟؟"
    else if (numberOfCorrectAnswers === 1) return "این یه دونه هم شانسی زدی؟"
    else if (numberOfCorrectAnswers === numberOfTotalAnswers - 1) return "این یه دونه هم از دستت در رفته!"
    else if (numberOfCorrectAnswers === numberOfTotalAnswers) return "آفرین! عالی بودی"
    else {
        if (correctAnswerStat.correctPercent > 50) {
            return "خوب بود بیشتر تلاش کن!"
        }
        else return "باید بیشتر کارکنی"
    }
}

function getCorrectAnswerStat() {
    const numberOfCorrectAnswers = answerStatus.filter(x => x === true).length
    const numberOfTotalAnswers = answerStatus.length
    return {
        correctCount: numberOfCorrectAnswers,
        correctPercent: (numberOfCorrectAnswers * 100) / numberOfTotalAnswers
    }
}

function generateProgressBarElement() {
    let countdown = questionTime
    const progressBarCounter = document.createElement('div')
    progressBarCounter.innerText = countdown;
    intervalCountDown = setInterval(function () {
        countdown--
        progressBarCounter.innerText = countdown;
    }, 1000)

    const progressBarWrapperElement = document.createElement('div')
    const progressBarElement = document.createElement('div')
    const progressBarTrackElement = document.createElement('div')
    progressBarWrapperElement.setAttribute('class', 'progress-bar-wrapper')
    progressBarElement.setAttribute('class', 'progress-bar')
    progressBarTrackElement.setAttribute('class', 'progress-bar__track')

    progressBarElement.appendChild(progressBarTrackElement)
    progressBarWrapperElement.appendChild(progressBarCounter)
    progressBarWrapperElement.appendChild(progressBarElement)


    return progressBarWrapperElement
}
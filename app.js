'use strict';

// Liste des sourates (id, nom arabe, nb de versets)
const surahs = [
    {id: 1, name_arabic: "الفاتحة", verses: 7},
    {id: 2, name_arabic: "البقرة", verses: 286},
    {id: 3, name_arabic: "آل عمران", verses: 200},
    {id: 4, name_arabic: "النساء", verses: 176},
    {id: 5, name_arabic: "المائدة", verses: 120},
    // … ajoutez les 114 sourates ici ou chargez via API
    {id: 114, name_arabic: "الناس", verses: 6}
];

// Extrait exemple de versets, à remplacer par vos données ou extraction API
const sampleVerses = {
    "1:1": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "1:2": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    "1:3": "الرَّحْمَٰنِ الرَّحِيمِ",
    "1:4": "مَالِكِ يَوْمِ الدِّينِ",
    "1:5": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    "1:6": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    "1:7": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
};

// Variables de configuration et états
let quizConfig = {};
let currentQuestion = 0;
let score = {correct: 0, incorrect: 0};
let quizHistory = [];
let usedQuestions = new Set();
let selectedMode = null;
let currentStep = 0;
let currentQuestionData = null;
let timer = {intervalId: null, startTime: null, pauseTime: null, totalPaused: 0};
let wakeLock = null;

// Initialisation après chargement DOM
document.addEventListener('DOMContentLoaded', () => {
    populateSurahSelects();
    updateVerseCount();
    setupEventListeners();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker enregistré'))
            .catch(e => console.error(e));
    }
});

// Remplit les selects pour choisir sourates
function populateSurahSelects() {
    const startSelect = document.getElementById('startSurah');
    const endSelect = document.getElementById('endSurah');
    surahs.forEach(surah => {
        const option1 = document.createElement('option');
        option1.value = surah.id;
        option1.textContent = `${surah.id}. ${surah.name_arabic}`;
        startSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = surah.id;
        option2.textContent = `${surah.id}. ${surah.name_arabic}`;
        endSelect.appendChild(option2);
    });
    startSelect.value = 1;
    endSelect.value = 114;
}

// Met à jour le nombre d’ayat dans la plage sélectionnée
function updateVerseCount() {
    const startSurah = parseInt(document.getElementById('startSurah').value);
    const endSurah = parseInt(document.getElementById('endSurah').value);
    const startVerse = parseInt(document.getElementById('startVerse').value) || 1;
    const endVerse = parseInt(document.getElementById('endVerse').value) || 1;

    let count = 0;
    if (startSurah === endSurah) {
        count = Math.max(0, endVerse - startVerse + 1);
    } else if (startSurah < endSurah) {
        for (let i = startSurah; i <= endSurah; i++) {
            const s = surahs.find(s => s.id === i);
            if (i === startSurah) {
                count += Math.max(0, s.verses - startVerse + 1);
            } else if (i === endSurah) {
                count += Math.min(endVerse, s.verses);
            } else {
                count += s.verses;
            }
        }
    }
    document.getElementById('verseCount').textContent = count;
}

// Met en place les écouteurs d’événements
function setupEventListeners() {
    document.getElementById('startSurah').addEventListener('change', () => {
        updateVerseCount();
        validateVerseInputs();
    });
    document.getElementById('endSurah').addEventListener('change', () => {
        updateVerseCount();
        validateVerseInputs();
    });
    document.getElementById('startVerse').addEventListener('input', () => {
        validateVerseInputs();
        updateVerseCount();
    });
    document.getElementById('endVerse').addEventListener('input', () => {
        validateVerseInputs();
        updateVerseCount();
    });
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedMode = parseInt(btn.dataset.mode);
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    document.getElementById('homeBtn').addEventListener('click', () => showPage('homePage'));
    document.getElementById('confirmAnswer').addEventListener('click', confirmAnswer);
    document

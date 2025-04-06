import React, { useState } from 'react'
import FlashcardList from './components/FlashcardList.jsx'
import CreateFlashcard from './components/CreateFlashcard.jsx'
import './App.css'

function App() {
  const [flashcards, setFlashcards] = useState(SAMPLE_FLASHCARDS);
  const [currentPage, setCurrentPage] = useState('create');

  const addFlashcard = (question, answer) => {
    const newFlashcard = {
      id: flashcards.length + 1,
      question,
      answer,
    };
    setFlashcards([...flashcards, newFlashcard]);
    setCurrentPage('list');
  };

  
  return (
    <div className="app">
      {currentPage === 'list' ? (
        <FlashcardList flashcards={flashcards} />
      ) : (
        <CreateFlashcard addFlashcard={addFlashcard} />
      )}
      <button onClick={() => setCurrentPage(currentPage === 'list' ? 'create' : 'list')}>
        {currentPage === 'list' ? 'Create Flashcard' : 'View Flashcards'}
      </button>
    </div>
  )
}

const SAMPLE_FLASHCARDS = [
  {
    id: 1,
    question: 'What is 2 + 2?',
    answer: '4',
  },
  {
    id: 2,
    question: 'Question 2',
    answer: 'Answer',
  }
];


export default App

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Lähettää kysymyksen backendille
  const handleAsk = async (customQuestion = question) => {
    try {
      const response = await axios.post('http://localhost:5000/ask', { question: customQuestion });
      const answerText = response.data.answer;

      const suggestionIndex = answerText.indexOf('Ehkä nämä kysymykset voivat auttaa: ');
      if (suggestionIndex !== -1) {
        setAnswer(answerText.substring(0, suggestionIndex).trim());
        const suggestionText = answerText.substring(suggestionIndex + 'Ehkä nämä kysymykset voivat auttaa: '.length).trim();
        const suggestionsArray = suggestionText.split('; ').map(suggestion => suggestion.trim());
        setSuggestions(suggestionsArray);
      } else {
        setAnswer(answerText);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Virhe kysymystä lähetettäessä:', error);
    }
  };

  // Kun käyttäjä klikkaa ehdotusta
  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    setSuggestions([]);
    handleAsk(suggestion); // Lähetetään valittu ehdotus suoraan
  };

  // Enter-näppäimen käsittely
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAsk();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Miten voin auttaa?</h1>
        <input 
          type="text" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)} 
          onKeyDown={handleKeyPress}
          placeholder='Kirjoita kysymyksesi tähän...'
          aria-label='Kysymyskenttä'
        />
        <button onClick={() => handleAsk()}>Kysy</button>
        <p>Vastaus: {answer}</p>
        {suggestions.length > 0 && (
          <div>
            <h2>Ehdotetut kysymykset:</h2>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)} style={{ cursor: 'pointer' }}>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;

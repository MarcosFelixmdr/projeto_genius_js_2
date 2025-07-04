'use client';

import { get } from 'http';
import { useState, useEffect } from 'react';

export default function Ranking({ onBackToMenu }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    getRanking();

    // Requisicao do tipo GET (all) para o banco de dados com order by points desc limit 10
  }, []);

  const getRanking = async () => {
    await fetch('/api/registers')
      .then(response => response.json())
      .then(data => {
        const sortedRankings = data.sort((a, b) => b.points - a.points).slice(0, 10);
        setRankings(sortedRankings);
      })
      .catch(error => console.error('Erro ao buscar rankings:', error));
  }

  const clearRankings = () => {
    if (confirm('Tem certeza que deseja limpar todo o ranking?')) {

      // Requisicao para o banco de dados do tipo delete all

      localStorage.removeItem('geniusRankings');
      setRankings([]);
    }
  };

  return (
    <div className="ranking">
      <div className="ranking-container">
        <div className="ranking-header">
          <button className="back-btn" onClick={onBackToMenu}>← MENU</button>
          <h1>RANKING 🏆</h1>
          <button className="clear-btn" onClick={clearRankings}>LIMPAR</button>
        </div>

        <div className="ranking-content">
          {rankings.length === 0 ? (
            <div className="no-rankings">
              <p>Nenhuma pontuação registrada ainda.</p>
              <p>Jogue para aparecer no ranking!</p>
            </div>
          ) : (
            <div className="ranking-list">
              <div className="ranking-item header">
                <span className="position">#</span>
                <span className="name">Jogador</span>
                <span className="score">Pontos</span>
                <span className="mode">Modo</span>
                <span className="date">Data</span>
              </div>
              
              {rankings.map((entry, index) => (
                <div key={index} className={`ranking-item ${index < 3 ? `top-${index + 1}` : ''}`}>
                  <span className="position">{index + 1}</span>
                  <span className="name">{entry.name}</span>
                  <span className="score">{entry.score}</span>
                  <span className="mode">{entry.mode}</span>
                  <span className="date">{entry.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
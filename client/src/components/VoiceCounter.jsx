import { useEffect, useRef } from 'react';
import './VoiceCounter.css';

const NEPALI_NUMS = ['शून्य','एक','दुई','तीन','चार','पाँच','छ','सात','आठ','नौ','दश',
  'एघार','बाह्र','तेह्र','चौध','पन्ध्र','सोह्र','सत्र','अठार','उन्नाइस','बीस',
  'एक्काइस','बाइस','तेइस','चौबीस','पच्चीस','छब्बीस','सत्ताइस','अट्ठाइस','उन्तीस','तीस',
  'एकतीस','बत्तीस','तेत्तीस','चौँतीस','पैँतीस','छत्तीस','सैँतीस','अड्तीस','उनन्चालीस','चालीस',
  'एकचालीस','बयालीस','तेतालीस','चौवालीस','पैंतालीस','छेचालीस','सेतालीस','अड्चालीस','उनन्पचास','पचास'];

function speakNumber(n, lang = 'ne-NP') {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const text = n <= 50 ? NEPALI_NUMS[n] : String(n);
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.9; u.volume = 1;
  window.speechSynthesis.speak(u);
}

export default function VoiceCounter({ value, onChange, unit, min = 1, max = 9999, lang = 'ne-NP' }) {
  const holdRef = useRef(null);

  const change = (delta) => {
    const next = Math.min(Math.max(value + delta, min), max);
    onChange(next);
    speakNumber(next, lang);
  };

  // Long-press to fast-change
  const startHold = (delta) => {
    holdRef.current = setInterval(() => {
      onChange(prev => {
        const next = Math.min(Math.max(prev + delta, min), max);
        return next;
      });
    }, 100);
  };
  const stopHold = () => clearInterval(holdRef.current);

  return (
    <div className="voice-counter">
      <button
        className="vc-btn vc-minus"
        onClick={() => change(-1)}
        onMouseDown={() => startHold(-1)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => startHold(-1)}
        onTouchEnd={stopHold}
        disabled={value <= min}
      >−</button>

      <div className="vc-display">
        <div className="vc-value">{value}</div>
        <div className="vc-unit">{unit}</div>
        <div className="vc-nepali">{value <= 50 ? NEPALI_NUMS[value] : value}</div>
      </div>

      <button
        className="vc-btn vc-plus"
        onClick={() => change(1)}
        onMouseDown={() => startHold(1)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={() => startHold(1)}
        onTouchEnd={stopHold}
        disabled={value >= max}
      >+</button>
    </div>
  );
}

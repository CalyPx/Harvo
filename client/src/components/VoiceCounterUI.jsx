import { useRef, useState } from 'react';
import './VoiceCounter.css';
import { speakNepali } from './VoiceCounter';

const N = [
  'शून्य','एक','दुई','तीन','चार','पाँच','छ','सात','आठ','नौ',
  'दश','एघार','बाह्र','तेह्र','चौध','पन्ध्र','सोह्र','सत्र','अठार','उन्नाइस',
  'बीस','एक्काइस','बाइस','तेइस','चौबीस','पच्चीस','छब्बीस','सत्ताइस','अट्ठाइस','उनन्तीस',
  'तीस','एकतीस','बत्तीस','तेत्तीस','चौँतीस','पैँतीस','छत्तीस','सैँतीस','अड्तीस','उनन्चालीस',
  'चालीस','एकचालीस','बयालीस','तेतालीस','चौवालीस','पैंतालीस','छयालीस','सत्चालीस','अठचालीस','उनन्पचास',
  'पचास','एकाउन्न','बाउन्न','त्रिपन्न','चौवन्न','पचपन्न','छपन्न','सत्तावन्न','अठ्ठावन्न','उनन्साठी',
  'साठी',
];

function toNepali(n) {
  if (n <= 60) return N[n] || String(n);
  if (n < 1000) {
    const h = Math.floor(n / 100), r = n % 100;
    return `${N[h]} सय${r > 0 ? ' ' + toNepali(r) : ''}`;
  }
  const t = Math.floor(n / 1000), r = n % 1000;
  return `${toNepali(t)} हजार${r > 0 ? ' ' + toNepali(r) : ''}`;
}

export default function VoiceCounter({ value, onChange, unit, min = 1, max = 9999 }) {
  const holdRef = useRef(null);
  const [typing, setTyping] = useState(false);
  const [draft,  setDraft]  = useState('');

  const change = (delta) => {
    const next = Math.min(Math.max(value + delta, min), max);
    onChange(next);
    speakNepali(toNepali(next));
  };

  const startHold = (delta) => {
    holdRef.current = setInterval(() => {
      onChange(prev => {
        const n = Math.min(Math.max(prev + delta, min), max);
        return n;
      });
    }, 120);
  };
  const stopHold = () => clearInterval(holdRef.current);

  const commitDraft = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n);
      speakNepali(toNepali(n));
    }
    setTyping(false);
    setDraft('');
  };

  return (
    <div className="vc-wrap">
      {/* MINUS — full left half */}
      <button
        className="vc-minus"
        disabled={value <= min}
        onClick={() => change(-1)}
        onPointerDown={() => startHold(-1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <span className="vc-sign">−</span>
      </button>

      {/* CENTER — tap to type */}
      <div className="vc-center" onClick={() => { if (!typing) { setTyping(true); setDraft(String(value)); } }}>
        {typing ? (
          <input
            className="vc-input"
            type="number"
            value={draft}
            autoFocus
            onChange={e => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={e => e.key === 'Enter' && commitDraft()}
          />
        ) : (
          <>
            <div className="vc-value">{value}</div>
            <div className="vc-unit">{unit}</div>
            <div className="vc-nepali">{toNepali(value)}</div>
          </>
        )}
      </div>

      {/* PLUS — full right half */}
      <button
        className="vc-plus"
        disabled={value >= max}
        onClick={() => change(1)}
        onPointerDown={() => startHold(1)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <span className="vc-sign">+</span>
      </button>
    </div>
  );
}

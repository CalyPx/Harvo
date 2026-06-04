import { useLanguage } from '../context/LanguageContext';
import './LangToggle.css';

export default function LangToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button className="lang-toggle" onClick={toggle} title="Switch Language / भाषा बदल्नुस्">
      <span className={`lang-opt ${lang === 'en' ? 'lang-active' : ''}`}>EN</span>
      <span className="lang-divider">|</span>
      <span className={`lang-opt ${lang === 'ne' ? 'lang-active' : ''}`}>नेपा</span>
    </button>
  );
}

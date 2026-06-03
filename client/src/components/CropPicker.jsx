import './CropPicker.css';

const CROPS = [
  { name: 'Tomato',     emoji: '🍅', nepali: 'गोलभेडा' },
  { name: 'Potato',     emoji: '🥔', nepali: 'आलु' },
  { name: 'Cabbage',    emoji: '🥬', nepali: 'बन्दाकोपी' },
  { name: 'Carrot',     emoji: '🥕', nepali: 'गाजर' },
  { name: 'Onion',      emoji: '🧅', nepali: 'प्याज' },
  { name: 'Garlic',     emoji: '🧄', nepali: 'लसुन' },
  { name: 'Corn',       emoji: '🌽', nepali: 'मकै' },
  { name: 'Chili',      emoji: '🌶️', nepali: 'खुर्सानी' },
  { name: 'Capsicum',   emoji: '🫑', nepali: 'भेडेखुर्सानी' },
  { name: 'Orange',     emoji: '🍊', nepali: 'सुन्तला' },
  { name: 'Mango',      emoji: '🥭', nepali: 'आँप' },
  { name: 'Lemon',      emoji: '🍋', nepali: 'कागती' },
  { name: 'Banana',     emoji: '🍌', nepali: 'केरा' },
  { name: 'Pineapple',  emoji: '🍍', nepali: 'भुईकटहर' },
  { name: 'Cauliflower',emoji: '🥦', nepali: 'काउली' },
  { name: 'Broccoli',   emoji: '🥦', nepali: 'ब्रोकाउली' },
  { name: 'Eggplant',   emoji: '🍆', nepali: 'भन्टा' },
  { name: 'Pumpkin',    emoji: '🎃', nepali: 'फर्सी' },
  { name: 'Cucumber',   emoji: '🥒', nepali: 'काँक्रो' },
  { name: 'Sweet Potato',emoji:'🍠', nepali: 'शकरखण्ड' },
  { name: 'Ginger',     emoji: '🫚', nepali: 'अदुवा' },
  { name: 'Rice',       emoji: '🌾', nepali: 'धान' },
  { name: 'Wheat',      emoji: '🌾', nepali: 'गहुँ' },
  { name: 'Beans',      emoji: '🫘', nepali: 'सिमी' },
];

export default function CropPicker({ selected, onSelect }) {
  return (
    <div className="crop-picker">
      {CROPS.map(crop => (
        <button
          key={crop.name}
          className={`crop-btn ${selected?.name === crop.name ? 'selected' : ''}`}
          onClick={() => onSelect(crop)}
        >
          <span className="crop-emoji">{crop.emoji}</span>
          <span className="crop-nepali">{crop.nepali}</span>
          <span className="crop-english">{crop.name}</span>
        </button>
      ))}
    </div>
  );
}

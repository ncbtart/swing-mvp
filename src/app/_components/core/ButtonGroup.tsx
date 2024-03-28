'use client';

import{ useState } from 'react';

type Button = {
  label: string;
  onClick: () => void;
};

type ButtonGroupProps = {
  buttons: Button[];
  onActiveChange: (activeLabel: string) => void; // Nouvelle prop pour la fonction de rappel
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons, onActiveChange }) => {
  const [activeLabel, setActiveLabel] = useState(buttons[0]?.label);

  const handleClick = (label: string, onClick: () => void) => {
    setActiveLabel(label);
    onClick();
    onActiveChange(label); // Appeler la fonction de rappel avec la nouvelle valeur active
  };

  return (
    <div className="inline-flex rounded-lg border border-gray-100 bg-gray-100 p-1 mt-4">
      {buttons.map((button) => (
        <button
          key={button.label}
          className={`inline-block rounded-md px-4 py-2 text-sm ${
            activeLabel === button.label ? 'bg-white text-blue-500' : 'text-gray-500 hover:text-gray-700'
          } focus:relative`}
          onClick={() => handleClick(button.label, button.onClick)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;

import React from 'react';
import { HORSE_BREEDS, BREED_OTHER_OPTION } from '../../data/breeds';

interface BreedSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  otherInputClassName: string;
}

/**
 * Breed picker with a free-text escape hatch. The dropdown covers the
 * published breed list; selecting "Other" reveals a text input so an
 * unlisted or cross-bred horse is never blocked from being admitted.
 */
export const BreedSelect: React.FC<BreedSelectProps> = ({
  id,
  value,
  onChange,
  className,
  otherInputClassName,
}) => {
  const isKnownBreed = value === '' || HORSE_BREEDS.includes(value);
  const [showOther, setShowOther] = React.useState(!isKnownBreed);

  return (
    <div>
      <select
        id={id}
        value={showOther ? BREED_OTHER_OPTION : value}
        onChange={(e) => {
          if (e.target.value === BREED_OTHER_OPTION) {
            setShowOther(true);
            onChange('');
          } else {
            setShowOther(false);
            onChange(e.target.value);
          }
        }}
        className={className}
      >
        <option value="">Select breed</option>
        {HORSE_BREEDS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
        <option value={BREED_OTHER_OPTION}>{BREED_OTHER_OPTION}</option>
      </select>
      {showOther && (
        <input
          value={value}
          placeholder="Enter breed"
          onChange={(e) => onChange(e.target.value)}
          className={otherInputClassName}
        />
      )}
    </div>
  );
};

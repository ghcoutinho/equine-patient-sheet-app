import React, { useCallback } from 'react';

/**
 * Enter moves to the next field.
 *
 * Charting a round or a lab panel means typing twenty numbers in a row. Reaching
 * for the mouse or tabbing past every button between fields is the difference
 * between charting at the stall and charting later from memory, so Enter walks
 * straight down the data entry fields and skips everything else.
 *
 * Shift+Enter walks back. Enter inside a textarea still inserts a newline.
 */

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]):not([readonly])',
  'select:not([disabled])',
  'textarea:not([disabled])',
].join(', ');

function fieldsIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  );
}

export function focusNextField(
  container: HTMLElement | null,
  current: EventTarget | null,
  backwards = false,
): boolean {
  if (!container || !(current instanceof HTMLElement)) return false;
  const fields = fieldsIn(container);
  const index = fields.indexOf(current);
  if (index === -1) return false;

  const next = fields[index + (backwards ? -1 : 1)];
  if (!next) {
    // At the end of the form: leave focus where it is rather than wrapping
    // round to the top, which would silently undo the clinician's place.
    current.blur();
    return true;
  }

  next.focus();
  if (next instanceof HTMLInputElement && next.type !== 'date') next.select();
  next.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return true;
}

/**
 * Attach to a container element. Returns an onKeyDown handler.
 *
 * `onSubmitAtEnd` fires when Enter is pressed on the last field, so a short
 * form can save without the clinician moving their hands.
 */
export function useEnterAdvance(
  containerRef: React.RefObject<HTMLElement | null>,
): (e: React.KeyboardEvent) => void {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const target = e.target as HTMLElement;
      // A textarea needs Enter for what Enter is for.
      if (target instanceof HTMLTextAreaElement) return;
      // Let a focused button do its own job.
      if (target instanceof HTMLButtonElement) return;

      if (focusNextField(containerRef.current, target, e.shiftKey)) {
        e.preventDefault();
      }
    },
    [containerRef],
  );
}

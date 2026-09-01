import React, { useEffect, useRef, useState } from 'react';

const pageSessionTextRuns = new Map();

const getRunKey = (text, typingSpeed, initialDelay) => `${text}-${typingSpeed}-${initialDelay}`;

const TextType = ({
  text,
  typingSpeed = 30,
  initialDelay = 250,
  loop = false,
  showCursor = true,
  hideCursorWhileTyping = false,
  className = '',
  highlightText = null,
  cursorClassName = '',
  sessionKey = 'default',
}) => {
  const fullText = typeof text === 'string' ? text : '';
  const highlightValue = typeof highlightText === 'string' && highlightText ? highlightText : null;
  const runKey = getRunKey(`${sessionKey}-${fullText}`, typingSpeed, initialDelay);
  const ownerRef = useRef({});
  const existingRun = pageSessionTextRuns.get(runKey);
  const [displayedText, setDisplayedText] = useState(
    existingRun ? fullText : ''
  );
  const [isComplete, setIsComplete] = useState(Boolean(existingRun));

  useEffect(() => {
    if (!fullText) {
      setDisplayedText('');
      setIsComplete(true);
      return undefined;
    }

    let run = pageSessionTextRuns.get(runKey);

    if (run?.status === 'complete') {
      setDisplayedText(fullText);
      setIsComplete(true);
      return undefined;
    }

    if (run?.owner !== ownerRef.current) {
      if (run) {
        clearTimeout(run.timeout);
        run.status = 'complete';
        run.listeners.forEach((listener) => listener(fullText, true));
      } else {
        run = {
          owner: ownerRef.current,
          status: 'running',
          index: 0,
          timeout: null,
          listeners: new Set(),
        };
        pageSessionTextRuns.set(runKey, run);

        const tick = () => {
          run.index += 1;
          const nextText = fullText.slice(0, run.index);
          const complete = run.index >= fullText.length;
          run.status = complete ? 'complete' : 'running';
          run.listeners.forEach((listener) => listener(nextText, complete));

          if (!complete) {
            run.timeout = setTimeout(tick, typingSpeed);
          }
        };

        run.timeout = setTimeout(tick, initialDelay);
      }
    }

    const updateText = (nextText, complete) => {
      setDisplayedText(nextText);
      setIsComplete(complete);
    };
    run.listeners.add(updateText);

    if (run.status === 'complete') {
      updateText(fullText, true);
    }

    return () => {
      run.listeners.delete(updateText);
    };
  }, [fullText, typingSpeed, initialDelay, loop]);

  const renderText = () => {
    if (!highlightValue || !fullText.includes(highlightValue)) {
      return displayedText;
    }

    const highlightIndex = fullText.indexOf(highlightValue);
    const highlightEnd = highlightIndex + highlightValue.length;
    const typedUntilHighlight = displayedText.slice(0, highlightIndex);
    const typedHighlight = displayedText.slice(highlightIndex, Math.min(highlightEnd, displayedText.length));
    const rest = displayedText.slice(Math.min(highlightEnd, displayedText.length));

    return (
      <>
        <span>{typedUntilHighlight}</span>
        <strong>{typedHighlight}</strong>
        <span>{rest}</span>
      </>
    );
  };

  const shouldShowCursor = showCursor && !isComplete && !(hideCursorWhileTyping && displayedText.length < fullText.length);

  return (
    <span className={className}>
      {renderText()}
      {shouldShowCursor && (
        <span className={cursorClassName || 'text-type-cursor'} aria-hidden="true">
          |
        </span>
      )}
    </span>
  );
};

export default TextType;

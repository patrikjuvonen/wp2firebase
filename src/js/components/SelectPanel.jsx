/**
 * WP 2 Firebase
 * Publish WP site to Firebase.
 *
 * Copyright (C) 2021  Patrik Juvonen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import MaterialIcon from './MaterialIcon';

const Details = styled.details`
  position: relative;
  user-select: none;
  width: fit-content;
  z-index: 1;
`;

const Toggle = styled.summary`
  align-items: center;
  color: #476282;
  display: flex;
  font-weight: 500;
  list-style: none;
  padding: 5px 0;
  position: relative;
  transition: color 0.2s ease;

  &:hover,
  &:focus {
    color: #1b3a57;
    cursor: pointer;
  }

  &::-webkit-details-marker {
    display: none;
  }
`;

const opac = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
  font-size: 16px;
  max-height: 256px;
  max-width: 280px;
  min-width: calc(100% + 42px);
  opacity: 0;
  overflow: auto;
  padding: 8px 0;
  position: absolute;
  top: 100%;
  transform: translate(-12px, 4px);
  transition: opacity 0.5s;

  [open] & {
    animation: ${opac} 0.1s ease forwards;
  }
`;

const OverlayLabel = styled.span`
  color: rgba(0, 0, 0, 0.54);
  display: block;
  font-size: 13px;
  line-height: 20px;
  padding: 8px 16px 4px;
`;

const Divider = styled.hr`
  border-bottom: 0;
  border-top-color: rgba(0, 0, 0, 0.12);
  display: block;
  margin: 8px 0;
`;

const Button = styled.button`
  align-items: center;
  background: ${({ selected }) =>
    selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'};
  border: 0;
  color: ${({ selected }) => (selected ? '#1967d2' : 'rgba(0, 0, 0, 0.87)')};
  cursor: pointer;
  display: flex;
  font-size: 14px;
  height: 32px;
  line-height: 20px;
  max-width: 100%;
  overflow: hidden;
  padding: 0 16px;
  text-align: left;
  user-select: none;
  white-space: nowrap;
  width: 100%;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.04);
  }
`;

export default function SelectPanel({
  links = [],
  values = [],
  valuesLabel = '',
}) {
  const currentValue = values.find(({ selected }) => selected === true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const detailsEl = useRef(null);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key !== 'Escape' && e.which !== 1) return;
      detailsEl.current.open = false;
    },
    [setOverlayVisible],
  );

  useEffect(() => {
    if (overlayVisible) {
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('click', handleKeyUp);
    } else {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleKeyUp);
    };
  }, [overlayVisible, handleKeyUp]);

  return (
    <Details
      onClick={(e) => {
        e.stopPropagation();
      }}
      onToggle={(e) => setOverlayVisible(e.target.open)}
      ref={detailsEl}
    >
      <Toggle aria-controls="select-panel" aria-expanded={overlayVisible}>
        {currentValue ? currentValue.value : 'No selection'}
        <MaterialIcon>arrow_drop_down</MaterialIcon>
      </Toggle>

      <Overlay id="select-panel">
        {links.map(({ onClick, text, ...rest }) => (
          <Button
            {...rest}
            key={text}
            onClick={(e) => {
              detailsEl.current.open = false;
              onClick(e);
            }}
            type="button"
          >
            {text}
          </Button>
        ))}

        <Divider />

        {valuesLabel && <OverlayLabel>{valuesLabel}</OverlayLabel>}

        {values
          .sort(({ value: a }, { value: b }) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
          })
          .sort(({ selected: a }, { selected: b }) => {
            if (a && !b) return -1;
            if (!a && b) return 1;
            return 0;
          })
          .map(({ selected, value, ...rest }) => (
            <Button {...rest} key={value} selected={selected} type="button">
              {value}
            </Button>
          ))}
      </Overlay>
    </Details>
  );
}

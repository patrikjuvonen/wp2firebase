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
import styled from 'styled-components';

import Button from './Button';
import MaterialIcon from './MaterialIcon';

import { Spinner } from './App';

const Label = styled.span`
  color: #757575;
  display: block;
  font-size: 13px;
  margin: 0 0 15px;
`;

const Dialog = styled.dialog`
  align-items: center;
  background-color: rgba(25, 33, 43, 0.4) !important;
  border: 0;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  margin: 0;
  opacity: 0;
  padding: 32px 0 0 180px;
  position: fixed;
  top: 0;
  transform: scale(0);
  transition: opacity 0.1s ease;
  width: 100%;
  z-index: 100;

  &[open] {
    opacity: 1;
    transform: scale(1);
  }
`;

const DialogContainer = styled.div`
  background-color: #fafafa;
  border-radius: 16px;
  box-shadow: 0 2px 3px 0 rgba(60, 64, 67, 0.3),
    0 6px 10px 4px rgba(60, 64, 67, 0.15);
  color: rgba(0, 0, 0, 0.54);
  max-height: 100%;
  min-height: 344px;
  overflow-y: auto;
  padding: 24px;
  position: relative;
  width: 696px;

  p {
    font-size: 14px;
  }
`;

const DialogHeading = styled.h2`
  color: rgba(0, 0, 0, 0.87);
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  margin: 0 0 16px;
`;

const DialogClose = styled.button`
  appearance: none;
  background: 0;
  border: 0;
  border-radius: 100%;
  color: rgba(0, 0, 0, 0.54);
  cursor: pointer;
  font-size: 24px;
  height: 40px;
  line-height: 24px;
  margin: -8px;
  padding: 8px 0;
  position: absolute;
  right: 24px;
  top: 24px;
  user-select: none;
  width: 40px;

  &:hover {
    color: rgba(0, 0, 0, 0.87);
  }
`;

const Help = styled.span`
  position: relative;

  i {
    cursor: default;
    font-size: 16px;
    margin-left: 7px;
    vertical-align: top;
  }

  &:hover i {
    color: rgba(0, 0, 0, 0.87);
  }

  &:hover div,
  > *:hover + div {
    visibility: visible;
  }
`;

const Tooltip = styled.div`
  background: #051e34;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  filter: drop-shadow(0 1px 2px rgba(60, 64, 67, 0.3))
    drop-shadow(0 2px 6px rgba(60, 64, 67, 0.15));
  font-size: 14px;
  left: 100%;
  line-height: 20px;
  max-width: 384px;
  padding: 16px 20px;
  position: absolute;
  top: 25%;
  transform: translate(8px, -25%);
  visibility: hidden;
  width: max-content;
  word-break: break-word;

  &::before {
    background: #051e34;
    content: '';
    display: block;
    height: 12px;
    left: 0;
    position: absolute;
    top: 25%;
    transform: translate(-50%, -25%) rotate(45deg);
    width: 12px;
  }
`;

export default function AddNewProjectDialog({
  closeable = true,
  config = {},
  dialogVisible = false,
  isLoading = false,
  setConfig = null,
  setDialogVisible = null,
  setLoading = null,
}) {
  const [isJSONValid, setJSONValid] = useState(false);
  const fileInputEl = useRef(null);
  const jsonInputEl = useRef(null);
  const jsonAccordionEl = useRef(null);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key !== 'Escape') return;
      setDialogVisible(false);
    },
    [setDialogVisible],
  );

  useEffect(() => {
    if (dialogVisible) {
      window.addEventListener('keyup', handleKeyUp);
    } else {
      window.removeEventListener('keyup', handleKeyUp);
    }

    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [dialogVisible, handleKeyUp]);

  const onJSONChange = (e) => {
    if (e.target.files) {
      setJSONValid(
        e.target.files[0] &&
          e.target.files[0].type === 'application/json' &&
          e.target.files[0].size > 512 &&
          e.target.files[0].size < 4096,
      );
      jsonInputEl.current.value = '';
      jsonAccordionEl.current.open = false;
    } else {
      try {
        setJSONValid(
          e.target.value.length > 512 &&
            e.target.value.length < 4096 &&
            !!JSON.parse(e.target.value),
        );
      } catch (e) {
        setJSONValid(false);
      }
      fileInputEl.current.value = '';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isJSONValid) return;

    setLoading('setup');

    const formData = new FormData();

    formData.set('action', 'add_service_account');
    formData.set('nonce', config.nonce);

    if (fileInputEl.current.files.length > 0) {
      formData.set('service_account', fileInputEl.current.files[0]);
    } else {
      formData.set('service_account', jsonInputEl.current.value);
    }

    const result = await fetch(e.target.action, {
      method: e.target.method,
      body: formData,
    });

    e.target.reset();
    setJSONValid(false);
    setLoading(false);

    if (!result.ok) return;

    const data = await result.json();
    setConfig({ ...config, ...data.data });
    setDialogVisible(false);
  };

  return (
    <Dialog
      onClick={closeable ? () => setDialogVisible(false) : null}
      open={dialogVisible}
    >
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <DialogHeading>Add a new project</DialogHeading>

        {closeable && (
          <DialogClose onClick={() => setDialogVisible(false)}>
            <MaterialIcon>close</MaterialIcon>
          </DialogClose>
        )}

        <p>
          <a
            href="https://console.firebase.google.com/project/"
            rel="noopener"
            target="_blank"
          >
            Open Firebase console
            <MaterialIcon
              style={{
                fontSize: '16px',
                marginLeft: '1px',
                verticalAlign: 'middle',
              }}
            >
              open_in_new
            </MaterialIcon>
          </a>
        </p>
        <p>Please fill in the project details below to get started.</p>

        <hr />
        <br />

        <form
          action="admin-ajax.php"
          encType="multipart/form-data"
          method="post"
          onSubmit={onSubmit}
        >
          <Label>
            Service account JSON
            <Help>
              <MaterialIcon>help_outline</MaterialIcon>
              <Tooltip>
                {
                  'You can create a new service account in your Firebase project settings.'
                }
              </Tooltip>
            </Help>
          </Label>

          <strong className="description">Upload a JSON file</strong>
          <br />
          <input
            accept="application/json"
            name="service_account"
            onChange={onJSONChange}
            ref={fileInputEl}
            type="file"
          />

          <br />
          <br />

          <details ref={jsonAccordionEl}>
            <summary>
              <strong className="description">Or paste as JSON</strong>
            </summary>
            <br />
            <textarea
              className="code"
              cols="80"
              name="service_account"
              onChange={onJSONChange}
              ref={jsonInputEl}
              rows="7"
            ></textarea>
          </details>

          <br />
          <br />

          <Button disabled={!isJSONValid || isLoading} type="submit">
            {isLoading === 'setup' ? 'Please wait' : 'Setup'}
            {isLoading === 'setup' && (
              <Spinner
                focusable="false"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '16px', height: '16px' }}
                viewBox="0 0 100 100"
              >
                <circle cx="50%" cy="50%" r="45"></circle>
              </Spinner>
            )}
          </Button>
        </form>
      </DialogContainer>
    </Dialog>
  );
}

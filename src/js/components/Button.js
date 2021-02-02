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
import styled from 'styled-components';

export default styled.button`
  align-items: center;
  background-color: #1a73e8;
  border: 0;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  letter-spacing: 0.25px;
  line-height: 36px;
  min-height: auto;
  padding: 0 16px;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;

  &:not([disabled]):hover {
    background-color: #1765cc;
    color: #fff;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.25;
  }
`;

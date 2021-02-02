/** @license
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
import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

window.addEventListener('load', function () {
  ReactDOM.render(<App />, document.getElementById('wp2firebase-app'));
});

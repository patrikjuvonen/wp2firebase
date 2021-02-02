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
const path = require('path');
const Terser = require('terser-webpack-plugin');

module.exports = (_, { mode: env }) => ({
  devtool: env === 'production' ? false : 'cheap-module-source-map',
  entry: {
    wp2firebase: path.join(__dirname, 'src', 'js'),
  },
  mode: env,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: true,
          },
        },
      },
    ],
  },
  optimization:
    env === 'production'
      ? {
          minimizer: [
            new Terser({
              parallel: true,
            }),
          ],
        }
      : {},
  output: {
    filename: '[name].js?v=[contenthash]',
    path: path.join(__dirname, 'dist'),
    publicPath: '',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  target: 'web',
});

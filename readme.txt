=== WP 2 Firebase ===
Contributors: patrikjuvonen
Donate link: https://github.com/sponsors/patrikjuvonen
Tags: google, firebase, sync, ssg, static, site, generator, generation, publish, cache, caching
Requires at least: 5.0
Tested up to: 5.6
Stable tag: 1.0.0
License: GPL-3.0
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Publish WP site to Firebase.


== Description ==

Publish WP site to Firebase.

**WARNING: Work in progress, not production ready, use at your own peril.**

Hobby project.

Lots of features and functionality still missing and unfinished, most notably
some links may not be found (i.e. Polylang multi-language pages, sitemaps, files
not under wp-content directory for example favicons uploaded directly under root).


== Prerequisities ==

1. An existing Firebase project with web platform and hosting activated (no deployments necessary!)
2. WordPress 5.0+
3. PHP 7.2+


== User installation ==

For detailed installation instructions, please read the [standard installation procedure for WordPress plugins](http://codex.wordpress.org/Managing_Plugins#Installing_Plugins).

1. Install plugin
2. Activate plugin
3. Navigate to Firebase under Tools
4. Run through the setup wizard
5. Done!


== Usage ==

1. Press Deploy to deploy your site to Firebase
2. Enjoy!


== Contribution ==


=== Issues ===

Feel free to submit issues in the GitHub issues section.


=== Pull requests ===

Feel free to submit pull requests in the GitHub pull requests section.

- Run `npm run build` to build the production files
- Run `composer update --optimize-autoloader` to optimize autoloader and update
  composer packages


=== Development ===


==== Prerequisities ====

1. [Composer](https://getcomposer.org/)
2. [Node.js](https://nodejs.org/en/)


==== Stack ====

- Babel
- Eslint with semistandard
- Prettier
- React 17
- Styled components
- Webpack 5


==== Get started ====

1. `composer install`
2. `npm install`
3. `npm run dev`


== Disclaimer ==

WP 2 Firebase WordPress plugin is not affiliated with or endorsed by WordPress,
Firebase, Google, Alphabet or other rightsholders. Any trademarks used belong to
their respective owners.


== License ==

Copyright (C) 2021 Patrik Juvonen

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.


== Author ==

Patrik Juvonen


== Changelog ==

= 1.0.0 =

  * Initial release

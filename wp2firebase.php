<?php
/*
Plugin Name: WP 2 Firebase
Plugin URI: https://wordpress.org/plugins/wp2firebase/
Description: Publish WP site to Firebase.
Version: 1.0.0
Text Domain: wp2firebase
Domain Path: /languages
Author: Patrik Juvonen
Author URI: https://github.com/patrikjuvonen
License: GPL-3.0
License URI: https://www.gnu.org/licenses/gpl-3.0.html
*/
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
namespace WP2Firebase;

if ( ! defined( 'ABSPATH' ) || defined( 'WP2FIREBASE' ) ) exit;

define( 'WP2FIREBASE', __FILE__ );

require_once 'vendor/autoload.php';

require_once 'src/google.php';
require_once 'src/firebase.php';
require_once 'src/core-hooks.php';
require_once 'src/ajax.php';

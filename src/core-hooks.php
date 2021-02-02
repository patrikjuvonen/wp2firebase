<?php
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

use WP_Admin_Bar;

if ( ! defined( 'ABSPATH' ) || ! defined( 'WP2FIREBASE' ) ) exit;

function activate_plugin() {

	register_setting( 'wp2firebase', 'firebase_project_id', array( 'show_in_rest' => false ) );
	register_setting( 'wp2firebase', 'firebase_service_accounts', array( 'show_in_rest' => false ) );
	delete_transient( 'google_api_access_token' );
	delete_transient( 'firebase_project_info' );
	delete_transient( 'firebase_project_releases' );
	delete_transient( 'firebase_project_releases_files' );

}
register_activation_hook( __FILE__, __NAMESPACE__ . '\activate_plugin' );

function add_admin_bar_node( WP_Admin_Bar $wp_admin_bar ) {

	if ( ! current_user_can( 'manage_options' ) ) return;

	$wp_admin_bar->add_node( array(
		'id' => 'wp2firebase',
		'title' => 'Firebase',
		'href' => admin_url( 'tools.php?page=wp2firebase' ),
	) );

}
add_action( 'admin_bar_menu', __NAMESPACE__ . '\add_admin_bar_node', 100 );

function add_admin_menu_page() {

	add_management_page( 'Firebase', 'Firebase', 'manage_options', 'wp2firebase', function () {
		echo '<div id="wp2firebase-app"></div>';
	} );

}
add_action( 'admin_menu', __NAMESPACE__ . '\add_admin_menu_page' );

function add_plugin_actions_links( array $links ): array {

	return array_merge( array( '<a href="' . admin_url( 'tools.php?page=wp2firebase' ) . '">Settings</a>' ), $links );

}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), __NAMESPACE__ . '\add_plugin_actions_links' );

function deactivate_plugin() {

	unregister_setting( 'wp2firebase', 'firebase_project_id' );
	unregister_setting( 'wp2firebase', 'firebase_service_accounts' );
	delete_transient( 'google_api_access_token' );
	delete_transient( 'firebase_project_info' );
	delete_transient( 'firebase_project_releases' );
	delete_transient( 'firebase_project_releases_files' );

}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\deactivate_plugin' );

function enqueue_admin_styles( string $hook_suffix ) {

	if ( 'tools_page_wp2firebase' !== $hook_suffix ) return;

	$plugin = get_plugin_data( WP2FIREBASE );

	wp_enqueue_script( 'wp2firebase', plugin_dir_url( WP2FIREBASE ) . 'dist/wp2firebase.js', null, $plugin[ 'Version' ] );
	wp_enqueue_style( 'google-fonts-roboto', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=block' );
	wp_enqueue_style( 'google-fonts-roboto-mono', 'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=block' );
	wp_enqueue_style( 'google-fonts-material-icons', 'https://fonts.googleapis.com/css2?family=Material+Icons&display=block' );
	wp_add_inline_script(
		'wp2firebase',
		'var wp2firebase=' . json_encode( array(
			'nonce' => wp_create_nonce( 'wp2firebase' ),
			'projects' => array_keys( get_service_accounts() ),
			'projectId' => get_project_id(),
			'projectInfo' => get_project_info(),
		), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ),
		'before'
	);

}
add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\enqueue_admin_styles' );

function uninstall_plugin() {

	delete_option( 'firebase_project_id' );
	delete_option( 'firebase_service_accounts' );
	delete_transient( 'google_api_access_token' );
	delete_transient( 'firebase_project_info' );
	delete_transient( 'firebase_project_releases' );
	delete_transient( 'firebase_project_releases_files' );

}
register_uninstall_hook( __FILE__, __NAMESPACE__ . '\uninstall_plugin' );

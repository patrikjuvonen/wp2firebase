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

if ( ! defined( 'ABSPATH' ) || ! defined( 'WP2FIREBASE' ) ) exit;

function add_service_account() {

	if ( false === wp_verify_nonce( $_POST['nonce'], 'wp2firebase' ) ) {
		wp_send_json_error( null, 403 );
		return;
	}

	$json = '';

	if ( isset( $_FILES['service_account'] ) ) {
		if ( empty( $_FILES['service_account']['tmp_name'] ) ) {
			wp_send_json_error( null, 400 );
			return;
		}

		$json = file_get_contents( $_FILES['service_account']['tmp_name'] );
	} elseif ( isset( $_POST['service_account'] ) ) {
		$json = $_POST['service_account'];
	}

	if ( ( ! $service_account = json_decode( $json, true ) )
		|| ! is_valid_service_account( $json )
	) {
		wp_send_json_error( null, 400 );
		return;
	}

	$service_accounts = get_service_accounts();
	$service_accounts[$service_account['project_id']] = $service_account;

	if ( update_option( 'firebase_service_accounts', serialize( $service_accounts ) )
		&& update_option( 'firebase_project_id', $service_account['project_id'] )
	) {
		delete_transient( 'google_api_access_token' );
		delete_transient( 'firebase_project_info' );
		delete_transient( 'firebase_project_releases' );
		delete_transient( 'firebase_project_releases_files' );

		wp_send_json_success( array(
			'projectId' => $service_account['project_id'],
			'projectInfo' => get_project_info( $service_account['project_id'] ),
			'projects' => array_keys( $service_accounts ),
		), 201 );

		return;
	} elseif ( $json === json_encode( $service_accounts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
		|| $service_account['project_id'] === get_option( 'firebase_project_id' )
	) {
		wp_send_json_success( array(
			'projectId' => $service_account['project_id'],
			'projectInfo' => get_project_info( $service_account['project_id'] ),
			'projects' => array_keys( $service_accounts ),
		) );

		return;
	}

	wp_send_json_error( null, 400 );

}
add_action( 'wp_ajax_add_service_account', __NAMESPACE__ . '\add_service_account' );

function deploy() {

	if ( false === wp_verify_nonce( $_POST['nonce'], 'wp2firebase' ) ) {
		wp_send_json_error( null, 403 );
		return;
	} elseif ( ( ! $project_info = get_project_info() )
		|| ( ! $access_token = get_access_token() )
		|| ! is_array( $releases = get_releases() ) ) {
		wp_send_json_error( null, 400 );
		return;
	}

	create_version();

	wp_send_json_success( array(
		'releases' => get_releases(),
	) );

}
add_action( 'wp_ajax_deploy', __NAMESPACE__ . '\deploy' );

function get_releases_ajax() {

	if ( false === wp_verify_nonce( $_GET['nonce'], 'wp2firebase' ) ) {
		wp_send_json_error( null, 403 );
		return;
	} elseif ( ( ! $project_info = get_project_info() )
		|| ( ! $access_token = get_access_token() ) ) {
		wp_send_json_error( null, 400 );
		return;
	}

	wp_send_json_success( array(
		'releases' => get_releases(),
	) );

}
add_action( 'wp_ajax_get_releases_ajax', __NAMESPACE__ . '\get_releases_ajax' );

function get_releases_files_ajax() {

	if ( false === wp_verify_nonce( $_GET['nonce'], 'wp2firebase' ) ) {
		wp_send_json_error( null, 403 );
		return;
	} elseif ( ( ! $project_info = get_project_info() )
		|| ( ! $access_token = get_access_token() ) ) {
		wp_send_json_error( null, 400 );
		return;
	}

	wp_send_json_success( array(
		'files' => get_releases_files(),
	) );

}
add_action( 'wp_ajax_get_releases_files_ajax', __NAMESPACE__ . '\get_releases_files_ajax' );

function set_project_id() {

	if ( false === wp_verify_nonce( $_POST['nonce'], 'wp2firebase' ) ) {
		wp_send_json_error( null, 403 );
		return;
	} elseif ( ! $service_accounts = get_service_accounts() ) {
		wp_send_json_error( null, 500 );
		return;
	} elseif ( ( ! isset( $service_accounts[$_POST['project_id']] ) )
		|| ! is_valid_service_account( $service_accounts[$_POST['project_id']] ) ) {
		wp_send_json_error( null, 400 );
		return;
	}

	update_option( 'firebase_project_id', $_POST['project_id'] );

	delete_transient( 'google_api_access_token' );
	delete_transient( 'firebase_project_info' );
	delete_transient( 'firebase_project_releases' );
	delete_transient( 'firebase_project_releases_files' );

	wp_send_json_success( array(
		'projectId' => $_POST['project_id'],
		'projectInfo' => get_project_info( $_POST['project_id'] ),
	) );

}
add_action( 'wp_ajax_set_project_id', __NAMESPACE__ . '\set_project_id' );

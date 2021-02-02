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

function get_access_token() {

	if ( ! $client = get_google_client() ) return;

	if ( ( ! $access_token = get_transient( 'google_api_access_token' ) )
		|| ( ! $access_token = unserialize( $access_token ) )
		|| time() >= $access_token['created'] + $access_token['expires_in']
	) {
		$client->refreshTokenWithAssertion();
		$access_token = $client->getAccessToken();
		set_transient( 'google_api_access_token', serialize( $access_token ), (int)$access_token['expires_in'] - 1 );
	}

	return $access_token;

}

function get_google_client() {

	if ( ! get_service_account() ) return null;

	$filepath = tempnam( sys_get_temp_dir(), '' );
	file_put_contents( $filepath, json_encode( get_service_account() ) );

	$client = new \Google\Client();
	$client->setAuthConfig( $filepath );
	$client->setApplicationName( 'WP2Firebase' );
	$client->setScopes( array( 'https://www.googleapis.com/auth/cloud-platform' ) );

	unlink( $filepath );

	return $client;

}

function get_service_account() {

	if ( ( ! $service_accounts = get_service_accounts() )
		|| ( ! $project_id = get_project_id() )
		|| ( ! isset( $service_accounts[$project_id] ) )
		|| ! is_valid_service_account( $service_account = $service_accounts[$project_id] ) ) return null;

	return $service_account;

}

function get_service_accounts(): array {

	if ( ( ! $service_accounts = get_option( 'firebase_service_accounts' ) )
		|| ( ! is_array( $service_accounts = unserialize( $service_accounts ) ) ) )
		return array();

	return $service_accounts;

}

function is_valid_service_account( $value ): bool {

	return ( ( is_string( $value )
		&& ( $service_account = json_decode( $value, true ) ) )
		|| ( $service_account = $value ) )
		&& isset(
			$service_account['type'],
			$service_account['project_id'],
			$service_account['private_key_id'],
			$service_account['private_key'],
			$service_account['client_email'],
			$service_account['client_id']
		)
		&& $service_account['type'] === 'service_account';

}

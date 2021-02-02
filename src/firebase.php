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

function create_version() {

	if ( ( ! get_service_account() )
		|| ( ! $project_info = get_project_info() )
		|| ( ! isset( $project_info['resources'], $project_info['resources']['hostingSite'] ) )
		|| ( ! $access_token = get_access_token() ) ) return;

	$site = $project_info['resources']['hostingSite'];

	set_time_limit( 60 * 5 );
	ignore_user_abort( true );

	$client = new \GuzzleHttp\Client( array(
		'base_uri' => 'https://firebasehosting.googleapis.com/v1beta1/sites/',
		'headers' => array( 'authorization' => "Bearer $access_token[access_token]" ),
	) );

	$create_version = $client->postAsync(
		"$site/versions",
		array(
			'json' => apply_filters( 'wp2firebase_version_config', array(
				'config' => array(
					'cleanUrls' => true,
					'headers' => array(),
					'redirects' => array(),
					'rewrites' => array(),
					'trailingSlashBehavior' => 'ADD',
				),
			) ),
		)
	);

	$data = array( 'files' => array() );

  $post_types = apply_filters( 'wp2firebase_post_types', array(
		'page',
		'post',
	) );

	$posts = get_posts( array(
		'numberposts' => -1,
		'post_status' => 'publish',
		'post_type' => $post_types,
	) );

	$urls = apply_filters( 'wp2firebase_extra_urls', array(
		get_post_type_archive_link( 'post' ),
	) );

	foreach ( $posts as $post ) {
		$urls[] = get_permalink( $post );
	}

	$version = $create_version->wait();
	$version = json_decode( $version->getBody(), true );
	if ( 'CREATED' !== $version['status'] ) return;

	$internal_client = new \GuzzleHttp\Client( array(
		'headers' => array( 'authorization' => getallheaders()['Authorization'] ),
		'verify' => false,
	) );

	$promises = array();
	$files = array();
	$more = array();

	foreach ( $urls as $url ) {
		$promises[$url] = $internal_client->getAsync( $url );
		$promises[$url]->then( function ( $response ) use ( &$more, &$files, &$data, $url, $site ) {
			$html = $response->getBody();

			$parsed_url = parse_url( $url );
			preg_match_all( '/(?:' . preg_quote( $parsed_url['host'] ) . '|"|\'|=)\/(wp-content\/.+?)["\'>\s]/im', $html, $additional );
			array_walk( $additional[1], function ( &$file ) {
				$file = parse_url( $file, PHP_URL_PATH );
			} );
			$more = array_merge( $more, $additional[1] );

			$html = str_replace( $parsed_url['host'], "$site.firebaseapp.com", $html );
			$gzip = gzcompress( $html, 9, ZLIB_ENCODING_GZIP );
			$hash = hash( 'sha256', $gzip );
			$trim = rtrim( $parsed_url['path'], '/' );
			if ( empty( $trim ) ) {
				$trim = '/index';
			}
			$data['files']["$trim.html"] = $hash;
			$files[$hash] = $gzip;
		} );
	}

	$responses = \GuzzleHttp\Promise\Utils::unwrap( $promises );

	$more = array_unique( $more );

	foreach ( $more as $file ) {
		if ( ! is_file( ABSPATH . $file ) ) continue;

		$contents = file_get_contents( ABSPATH . $file );
		$gzip = gzcompress( $contents, 9, ZLIB_ENCODING_GZIP );
		$hash = hash( 'sha256', $gzip );
		$data['files']["/$file"] = $hash;
		$files[$hash] = $gzip;
	}

	if ( ( ! $response = $client->post( "https://firebasehosting.googleapis.com/v1beta1/$version[name]:populateFiles", array(
		'json' => $data,
	) ) )
		|| ( ! $result = json_decode( $response->getBody(), true ) )
		|| ( ! isset( $result['uploadRequiredHashes'], $result['uploadUrl'] ) )
		|| ( empty( $result['uploadRequiredHashes'] ) )
	) return;

	$promises = array();

	foreach ( $result['uploadRequiredHashes'] as $hash ) {
		$promises[$hash] = $client->postAsync( "$result[uploadUrl]/$hash", array(
			'body' => $files[$hash],
		) );
	}

	$responses = \GuzzleHttp\Promise\Utils::unwrap( $promises );

	if ( ! $client->patch( "https://firebasehosting.googleapis.com/v1beta1/$version[name]?update_mask=status", array(
		'json' => array( 'status' => 'FINALIZED' ),
	) ) ) return;

	if ( ! $client->post( "https://firebasehosting.googleapis.com/v1beta1/sites/$site/releases?versionName=$version[name]" ) ) return;

	delete_transient( 'firebase_project_releases' );
	delete_transient( 'firebase_project_releases_files' );

}

function get_project_id() {

	return get_option( 'firebase_project_id' );

}

function get_project_info( $project_id = null ) {

	if ( ! get_service_account() ) return;
	if ( $project = unserialize( get_transient( 'firebase_project_info' ) ) ) return $project;
	if ( ! $access_token = get_access_token() ) return;

	if ( ! $project_id ) $project_id = get_project_id();

	$client = new \GuzzleHttp\Client( array(
		'base_uri' => 'https://firebase.googleapis.com/v1beta1/projects/',
		'headers' => array( 'authorization' => "Bearer $access_token[access_token]" ),
	) );

	if ( ( ! $response = $client->get( $project_id ) )
		|| ! is_array( $project = json_decode( $response->getBody(), true ) )
	) return;

	set_transient( 'firebase_project_info', serialize( $project ), 3600 );

	return $project;

}

function get_releases() {

	if ( ! get_service_account() ) return;
	if ( $releases = unserialize( get_transient( 'firebase_project_releases' ) ) ) return $releases;
	if ( ( ! $access_token = get_access_token() )
		|| ( ! $project_info = get_project_info() )
		|| ( ! isset( $project_info['resources'], $project_info['resources']['hostingSite'] ) )
	) return;

	$site = $project_info['resources']['hostingSite'];

	$client = new \GuzzleHttp\Client( array(
		'base_uri' => 'https://firebasehosting.googleapis.com/v1beta1/sites/',
		'headers' => array( 'authorization' => "Bearer $access_token[access_token]" ),
	) );

	if ( ( ! $response = $client->get( "$site/releases" ) )
		|| ( ! is_array( $data = json_decode( $response->getBody(), true ) ) )
		|| ( ! isset( $data['releases'] ) )
	) return array();

	$releases = $data['releases'];

	set_transient( 'firebase_project_releases', serialize( $releases ), 3600 );

	return $releases;

}

function get_releases_files() {

	if ( ( ! get_service_account() ) || ! $releases = get_releases() ) return;
	if ( $files = unserialize( get_transient( 'firebase_project_releases_files' ) ) ) return $files;
	if ( ! $access_token = get_access_token() ) return;

	$client = new \GuzzleHttp\Client( array(
		'base_uri' => 'https://firebasehosting.googleapis.com/v1beta1/',
		'headers' => array( 'authorization' => "Bearer $access_token[access_token]" ),
	) );

	$promises = array();

	foreach ( get_releases() as $release ) {
		$name = $release['version']['name'];
		$promises[$release['name']] = $client->getAsync( "$name/files" );
	}

	$settled = \GuzzleHttp\Promise\Utils::settle($promises)->wait();

	$files = array();

	foreach ( $settled as $name => $settle ) {
		$response = $settle['value'];

		if ( 'fulfilled' !== $settle['state'] || 200 !== $response->getStatusCode() ) continue;

		$files[$name] = json_decode( $response->getBody(), true );

		if ( isset( $files[$name]['files'] ) ) {
			$files[$name] = $files[$name]['files'];
		}
	}

	set_transient( 'firebase_project_releases_files', serialize( $files ), 3600 );

	return $files;

}

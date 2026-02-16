<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/SettingsController.php';

class AviationController {
    private $settings;
    private $apiKey;
    private $baseUrl = 'https://api.aviationstack.com/v1/';

    public function __construct() {
        $this->settings = new SettingsController();
        $this->apiKey = $this->settings->getSetting('aviationstack_api_key');
    }

    /**
     * Proxy request to AviationStack
     */
    private function makeRequest($endpoint, $params = []) {
        if (!$this->apiKey) {
            sendError('AviationStack API Key not configured', 500);
        }

        $params['access_key'] = $this->apiKey;
        $url = $this->baseUrl . $endpoint . '?' . http_build_query($params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            $error = json_decode($response, true);
            sendError('AviationStack API Error: ' . ($error['error']['info'] ?? 'Unknown error'), $httpCode);
        }

        header('Content-Type: application/json');
        echo $response;
        exit;
    }

    public function getFlights($params = []) {
        $this->makeRequest('flights', $params);
    }

    public function getAirports($params = []) {
        $this->makeRequest('airports', $params);
    }

    public function getAirlines($params = []) {
        $this->makeRequest('airlines', $params);
    }

    public function getRoutes($params = []) {
        $this->makeRequest('routes', $params);
    }
}


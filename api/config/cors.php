<?php

declare(strict_types=1);

// CORS for the decoupled SPA. Only the configured frontend origin is allowed.
// Token (Bearer) auth needs no cookies, so credentials stay disabled.
return [
    'paths' => ['api/*', 'docs/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];

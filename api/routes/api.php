<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\InvestmentController;
use Illuminate\Support\Facades\Route;

// --- Public auth endpoints -------------------------------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Authenticated endpoints (Bearer token) --------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/investments', [InvestmentController::class, 'index']);
    Route::post('/investments', [InvestmentController::class, 'store']);
    Route::get('/investments/{investment}', [InvestmentController::class, 'show']);
    Route::get('/investments/{investment}/withdrawal-preview', [InvestmentController::class, 'withdrawalPreview']);
    Route::post('/investments/{investment}/withdraw', [InvestmentController::class, 'withdraw']);
});

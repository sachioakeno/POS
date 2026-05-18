<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;

// ==========================================
// PINTU DEPAN (Bebas Akses Tanpa Token)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ==========================================
// RUANGAN DALAM (Wajib Bawa Token / Sudah Login)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Master Menu
    Route::get('/menus', [MenuController::class, 'index']);
    Route::post('/menus', [MenuController::class, 'store']);
    Route::put('/menus/{id}', [MenuController::class, 'update']);
    Route::delete('/menus/{id}', [MenuController::class, 'destroy']);

    // Master Ingredients (Bahan Baku)
    Route::get('/ingredients', [IngredientController::class, 'index']);
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::put('/ingredients/{id}', [IngredientController::class, 'update']);
    Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);
    Route::post('/ingredients/{id}/restock', [IngredientController::class, 'addStock']);

    // POS & Orders (Transaksi)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/checkout', [OrderController::class, 'store']); 
    Route::delete('/orders/{id}/void', [OrderController::class, 'destroy']);

    // Analytics & AI Insights (Smart Dashboard)
    Route::get('/analytics', [AnalyticsController::class, 'getDashboardData']);
    Route::get('/ai-insights', [AnalyticsController::class, 'getAiInsights']); 
    Route::post('/upload-sales', [SalesController::class, 'upload']);
    Route::get('/analyze-trends', [SalesController::class, 'analyze']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
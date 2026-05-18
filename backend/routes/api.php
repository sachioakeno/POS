<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;

Route::post('/upload-sales', [SalesController::class, 'upload']);
Route::get('/analyze-trends', [SalesController::class, 'analyze']);
Route::post('/checkout', [OrderController::class, 'store']);


// Rute CRUD Master Menu
Route::get('/menus', [MenuController::class, 'index']);
Route::post('/menus', [MenuController::class, 'store']);
Route::put('/menus/{id}', [MenuController::class, 'update']);
Route::delete('/menus/{id}', [MenuController::class, 'destroy']);

// ingredients
Route::get('/ingredients', [IngredientController::class, 'index']);
Route::post('/ingredients', [IngredientController::class, 'store']);
Route::put('/ingredients/{id}', [IngredientController::class, 'update']);
Route::delete('/ingredients/{id}', [IngredientController::class, 'destroy']);
Route::post('/ingredients/{id}/restock', [IngredientController::class, 'addStock']);

// Tambahkan di bawah rute checkout
Route::get('/orders', [OrderController::class, 'index']);
Route::delete('/orders/{id}/void', [OrderController::class, 'destroy']);

// Rute untuk Smart Dashboard
Route::get('/analytics', [AnalyticsController::class, 'getDashboardData']);
Route::get('/ai-insights', [AnalyticsController::class, 'getAiInsights']); 

// login 
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// setting
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/settings', [SettingController::class, 'update']);
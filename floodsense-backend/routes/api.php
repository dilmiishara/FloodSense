<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;

// Login route
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard', function (Request $request) {
        return $request->user();
    });

});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    
    Route::get('/admin/dashboard', function () {
        return response()->json([
            'message' => 'Admin Dashboard'
        ]);
    });

});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return "Admin Only Dashboard";
    });
});

// Officer routes
Route::middleware(['auth:sanctum', 'role:officer'])->group(function () {
    Route::get('/officer/dashboard', function () {
        return "Technical Officer Dashboard";
    });
});

Route::get('/posts', [PostController::class, 'index']);
Route::post('/posts', [PostController::class, 'store']);

Route::get('/test', function () {
    return response()->json([
        'message' => 'API working'
    ]);
});
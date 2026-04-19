<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;

Route::get('/ping', function () {
  return response()->json([
    'message' => 'API OK',
    'time' => now()
  ]);
});

Route::apiResource('posts', PostController::class)->only(['index', 'show']);
Route::apiResource('ads', AdController::class)->only(['index', 'show']);

// group routes for posts
Route::prefix('users/{user}')->group(function () {
    Route::get('/posts', [PostController::class, 'userPosts']);
    Route::get('/ads', [AdController::class, 'userAds']);
});

Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('posts', PostController::class)->except(['index', 'show']);
    Route::apiResource('ads', AdController::class)->except(['index', 'show']);

    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);
});


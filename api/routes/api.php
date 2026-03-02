<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;

Route::get('/ping', function () {
  return response()->json([
    'message' => 'API OK',
    'time' => now()
  ]);
});

Route::apiResource('posts', PostController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', [UserController::class, 'show']);
});


<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostController;

Route::get('/ping', function () {
  return response()->json([
    'message' => 'API OK',
    'time' => now()
  ]);
});

Route::apiResource('posts', PostController::class);

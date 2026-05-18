<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Post $post)
    {
        $user = $request->user();

        $existing = $post->likes()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;

            Notification::where('user_id', $post->user_id)
                ->whereNull('read_at')
                ->where('data->type', 'like')
                ->where('data->post_id', $post->id)
                ->where('data->from_user_id', $user->id)
                ->delete();
        } else {
            $post->likes()->create(['user_id' => $user->id]);
            $liked = true;

            if ($post->user_id !== $user->id) {
                Notification::create([
                    'user_id' => $post->user_id,
                    'title' => 'Nouveau like 👍',
                    'body' => trim(($user->firstname ?? $user->username ?? 'Quelqu’un') . ' a aimé votre post'),
                    'data' => [
                        'type' => 'like',
                        'post_id' => $post->id,
                        'from_user_id' => $user->id,
                    ],
                ]);
            }
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->likes()->count(),
        ]);
    }
}

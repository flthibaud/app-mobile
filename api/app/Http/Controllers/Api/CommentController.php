<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Post $post)
    {
        return $post->comments()
            ->with('user')
            ->latest()
            ->get();
    }

    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $user = $request->user();

        $comment = $post->comments()->create([
            'user_id' => $user->id,
            'body' => $validated['body'],
        ])->load('user');

        if ($post->user_id !== $user->id) {
            $excerpt = mb_substr($validated['body'], 0, 80);
            if (mb_strlen($validated['body']) > 80) {
                $excerpt .= '…';
            }

            Notification::create([
                'user_id' => $post->user_id,
                'title' => 'Nouveau commentaire 💬',
                'body' => trim(($user->firstname ?? $user->username ?? 'Quelqu’un') . ' : ' . $excerpt),
                'data' => [
                    'type' => 'comment',
                    'post_id' => $post->id,
                    'comment_id' => $comment->id,
                    'from_user_id' => $user->id,
                ],
            ]);
        }

        return response()->json($comment, 201);
    }

    public function destroy(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            abort(403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted']);
    }
}

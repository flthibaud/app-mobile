<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;

class PostController extends Controller
{
    private function baseQuery()
    {
        $userId = auth('sanctum')->id();

        $query = Post::with('user')->withCount(['likes', 'comments']);

        if ($userId) {
            $query->withExists(['likes as liked_by_me' => function ($q) use ($userId) {
                $q->where('user_id', $userId);
            }]);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $perPage = min($request->integer('per_page', 12), 50);

        return $this->baseQuery()->latest()->paginate($perPage);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'body' => 'required',
        ]);

        $post = Post::create([
            'title' => $request->title,
            'body' => $request->body,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($post, 201);
    }

    public function show(string $id)
    {
        $post = $this->baseQuery()->findOrFail($id);
        return response()->json($post);
    }

    public function userPosts(Request $request, string $username)
    {
        $perPage = min($request->integer('per_page', 12), 50);

        $posts = $this->baseQuery()
            ->whereHas('user', function ($query) use ($username) {
                $query->where('username', $username);
            })
            ->latest()
            ->paginate($perPage);

        return response()->json($posts);
    }

    public function update(Request $request, string $id)
    {
        $post = Post::findOrFail($id);

        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required',
            'body' => 'required',
        ]);

        $post->update([
            'title' => $request->title,
            'body' => $request->body,
        ]);

        return response()->json($post);
    }

    public function destroy(Request $request, string $id)
    {
        $post = Post::findOrFail($id);

        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}

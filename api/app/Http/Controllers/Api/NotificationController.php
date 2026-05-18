<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $userId = $request->user()->id;

        $headers = [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ];

        return response()->stream(function () use ($userId) {
            $start = time();
            $sentIds = [];

            while (time() - $start < 55) {
                if (connection_aborted()) {
                    break;
                }

                $notifications = Notification::where('user_id', $userId)
                    ->whereNull('read_at')
                    ->orderBy('id')
                    ->get();

                foreach ($notifications as $notification) {
                    if (in_array($notification->id, $sentIds, true)) {
                        continue;
                    }

                    echo "event: notification\n";
                    echo 'data: ' . json_encode($notification) . "\n\n";

                    $sentIds[] = $notification->id;
                }

                if (function_exists('ob_get_level') && ob_get_level() > 0) {
                    @ob_flush();
                }
                @flush();

                sleep(3);
            }
        }, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'data' => ['nullable', 'array'],
        ]);

        $notification = Notification::create($validated);

        return response()->json($notification, 201);
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json($notification);
    }
}

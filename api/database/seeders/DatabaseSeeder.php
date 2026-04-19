<?php

namespace Database\Seeders;

use App\Models\Ad;
use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = User::factory(10)->create();

        Post::factory(50)->make()->each(function ($post) use ($users) {
            $post->user_id = $users->random()->id;
            $post->save();
        });

        Ad::factory(50)->make()->each(function ($ad) use ($users) {
            $ad->user_id = $users->random()->id;
            $ad->save();
        });
    }
}

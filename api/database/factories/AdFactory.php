<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ad>
 */
class AdFactory extends Factory
{
    private const CITIES = [
        ['city' => 'Paris',      'lat' => 48.8566, 'lng' => 2.3522],
        ['city' => 'Lyon',       'lat' => 45.7640, 'lng' => 4.8357],
        ['city' => 'Marseille',  'lat' => 43.2965, 'lng' => 5.3698],
        ['city' => 'Toulouse',   'lat' => 43.6047, 'lng' => 1.4442],
        ['city' => 'Bordeaux',   'lat' => 44.8378, 'lng' => -0.5792],
        ['city' => 'Nantes',     'lat' => 47.2184, 'lng' => -1.5536],
        ['city' => 'Strasbourg', 'lat' => 48.5734, 'lng' => 7.7521],
        ['city' => 'Lille',      'lat' => 50.6292, 'lng' => 3.0573],
        ['city' => 'Nice',       'lat' => 43.7102, 'lng' => 7.2620],
        ['city' => 'Rennes',     'lat' => 48.1173, 'lng' => -1.6778],
    ];

    public function definition(): array
    {
        $city = fake()->randomElement(self::CITIES);

        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(3),
            'image' => fake()->boolean(60)
                ? 'ads/' . fake()->uuid() . '.jpg'
                : null,
            'city' => $city['city'],
            'lat' => $city['lat'] + fake()->randomFloat(5, -0.05, 0.05),
            'lng' => $city['lng'] + fake()->randomFloat(5, -0.05, 0.05),
            'user_id' => \App\Models\User::inRandomOrder()->first()->id,
        ];
    }
}
